const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const orderModel = require("../models/orderModel")
const validate = require('../validators/validator');



const createOrder = async (req, res)=>{
    try {
        const userId = req.params.userId
        let tokenId = req.userId
        let Body = req.body

        if (!(validate.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "userId is not valid" });;
        }
        if (!(validate.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "Token is not valid" });;
        }

        const user = await userModel.findOne({ _id: userId })
        if (!user) {
           return res.status(400).send({ status: false, msg: "User not found" })
        }
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: "You Are Not Authorized To Perform This Task" });
        }
        if (!validate.isValidRequestBody(Body)) {
            return res.status(400).send({ status: false, message: "Please provide The Body" });
        }
        let { cartId, cancellable, status } = Body
        if (!(validate.isValidObjectId(cartId))) {
            return res.status(400).send({ status: false, message: "cartId is not valid" });;
        }
        if (!validate.isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide The cartId" });
        }
        if (!validate.isValid(status)) {
            return res.status(400).send({ status: false, message: "Please provide The status" });
        }
        if (!validate.isValidStatus(status)) {
            return res.status(400).send({ status: false, message: "Status should be among 'pending', 'cancelled', 'completed' " });
        }

        const cartDetails = await cartModel.findOne({ _id: cartId })
        if (!(cartDetails.userId == userId)) {
            return res.status(400).send({ status: false, message: "This Cart does not belong to You" });

        }

        if (!cartDetails) {
            return res.status(400).send({ status: false, message: `cart not present` });
        }

        const totalItems = cartDetails.items.length
        var totalQuantity = 0;
        for (let i in cartDetails.items) {totalQuantity += cartDetails.items[i].quantity}
        const orderData = {
            userId: userId,
            items: cartDetails.items,
            totalPrice: cartDetails.totalPrice,
            totalItems: totalItems,
            totalQuantity: totalQuantity,
            cancellable: cancellable,
            status: status

        }
        const order = await orderModel.create(orderData)
        return res.status(201).send({ status: true, msg: "Your Order Has Been Placed", data: order })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
}


const updateOrder = async (req, res)=>{
    try {
        const userId = req.params.userId
        let tokenId = req.userId
        let Body = req.body
        if (!(validate.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "userId is not valid" });;
        }
        if (!(validate.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "Token is not valid" });;
        }
        const user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(400).send({ status: false, message: `userId  is not Valid` });
        }
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: "You Are Not Authorized To Perform This Task" });
        }
        let { orderId, status } = Body

        if (!validate.isValidRequestBody(Body)) {
            return res.status(400).send({ status: false, message: "Please provide The Data" });
        }
        if (!validate.isValid(orderId)) {
            return res.status(400).send({ status: false, message: "Please provide OrderId" });
        }
        if (!(validate.isValidObjectId(orderId))) {
            return res.status(400).send({ status: false, message: "orderId is not valid" });;
        }
        if (!validate.isValid(status)) {
            return res.status(400).send({ status: false, message: "Please provide status" });
        }
        if (!validate.isValidStatus(status)) {
            return res.status(400).send({ status: false, message: "Status should be among 'pending', 'cancelled', 'completed' " });
        }
        const order = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!order) {
            return res.status(400).send({ status: false, message: "Please provide  Vaild OrderId for updataion" });
        }

        if (!(order.userId == userId)) {
            return res.status(400).send({ status: false, message: "This order does not belong to You " });

        }
        if (orderDetail.cancellable == ! 'true') {
            return res.status(400).send({ status: false, message: "You Can't Cancell The Order" });

        }
        if (orderDetail.status == 'completed') {
            return res.status(400).send({ status: false, message: "This order has been completed Already So You Can't Update" });
        }
        if (orderDetail.status == 'cancelled') {
            return res.status(400).send({ status: false, message: "This order has been cancelled Already So You Can't Update" });
        }
        const updatedorder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
        return res.status(200).send({ status: true, message: "Order Updated Successfully ", data: updatedorder });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = { createOrder, updateOrder }