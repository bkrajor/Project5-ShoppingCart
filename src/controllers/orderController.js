const orderModel = require("../models/orderModel")
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const { isValidBody, isValid, isValidObjectId } = require("../util/validator")

// *********************************************CREATE ORDER****************************************************

const createOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        const data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Invalid Parameters" })

        const { cancellable } = data

        // -------------CHECKING cart is already present for user or not------------
        const cart = await cartModel.findOne({ userId: userId }).lean().select({ updatedAt: 0, createdAt: 0, __v: 0, _id: 0 })
        if (!cart) return res.status(404).send({ status: false, message: "cart not found to place an order.." })
        if (cart.items.length == 0) return res.status(404).send({ status: false, message: "Cart is empty... First add Product to Cart." })

        if (!isValid(cancellable)) return res.status(400).send({ status: false, message: "Provide cancellable Field" })
        if (typeof cancellable != "boolean") return res.status(400).send({ status: false, message: "cancellable should be true or false only" })

        cart.totalQuantity = cart.items.map(x => x.quantity).reduce((x, total) => x + total)
        cart.cancellable = cancellable

        const orderCreated = await orderModel.create(cart)
        res.status(201).send({ status: true, message: "order created successfully", data: orderCreated })

        await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

// *********************************************UPDATE ORDER****************************************************

const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        const data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Invalid Parameters" })

        // ---------------DESTRUCTURING bodyData---------------
        const { orderId, status } = data

        // ------------------------VALIDATION starts from here-------------------------
        if (!isValid(orderId)) return res.status(400).send({ status: false, message: "Provide orderId " })
        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "invalid order Id.." })

        if (!isValid(status)) return res.status(400).send({ status: false, message: "Provide Order Status" })
        if (!isValidStatus(status)) return res.status(400).send({ status: false, message: "status should be among 'pending','completed' and 'cancelled' only" })

        const searchOrder = await orderModel.findById({ _id: orderId })
        if (!searchOrder) return res.status(404).send({ status: false, message: "order not found" })
        if (searchOrder.userId != userId) return res.status(400).send({ status: false, message: "the order does not belongs to this user" })


        if (status == 'cancelled' && searchOrder.cancellable !== true) return res.status(400).send({ status: false, message: "You can not cancel the order" })

        const orderUpdated = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
        return res.status(200).send({ status: true, message: "Order status updated successfully", data: orderUpdated })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}



module.exports = { createOrder, updateOrder }