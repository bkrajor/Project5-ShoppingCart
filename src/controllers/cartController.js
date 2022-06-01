const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const {
    isValid, isValidBody, isValidObjectId, isValidQuantity
} = require('../util/validator')

// ***************************************************CREATE CART****************************************************** 

const createCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId is invalid" })

        const user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: " user not found" })
        let data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Please provide valid request body" })

        const { quantity, productId } = data

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid product Id.." })
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}` })
        
        const productPrice = product.price

        if (!isValidQuantity(quantity)) return res.status(400).send({ status: false, message: "quantity should contain number only.." })

        const isCartExist = await cartModel.findOne({ userId: userId })

        if (isCartExist) {
            let alreadyProductsId = isCartExist.items.map(x => x.productId.toString())
            if (alreadyProductsId.includes(productId)) {
                let updatedCart = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": quantity, totalPrice: productPrice * data.quantity } }, { new: true })
                return res.status(200).send({ status: true, message: "updated", data: updatedCart })
            }
            else {
                let updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, { $push: { items: data }, $inc: { totalItems: 1, totalPrice: productPrice * data.quantity } }, { new: true })
                return res.status(200).send({ status: true, message: "updated 2", data: updatedCart })
            }
        }
        const cartCreate = {
            userId: userId,
            items: [data],
            totalItems: 1,
            totalPrice: (data.quantity) * productPrice
        }
        const cartCreated = await cartModel.create(cartCreate)
        return res.status(201).send({ status: true, message: "cart created successfully", data: cartCreated })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

// ***************************************************UPDATE CART******************************************************************

const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const { cartId, productId, removeProduct } = req.body

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })

        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "invalid cart Id.." })

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid product Id.." })

        if (isValidQuantity(removeProduct)) return res.status(400).send({ status: false, message: "remove Product should contain 0 and 1 only.." })

        const findCart = await cartModel.findOne({ userId: userId })
        if (!findCart) return res.status(404).send({ status: false, messsage: "Cart not found" })

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, message: "product details not found or may be deleted" })
        let reducePrice = findProduct.price

        if (removeProduct == 0) {
            const cart = await cartModel.findOne({ "items.productId": productId, userId: userId })
            const quantity = cart.items.filter(x => x.productId.toString() === productId)[0].quantity
            const deleteProduct = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -reducePrice * quantity } }, { new: true })
            return res.status(200).send({ status: true, messsage: "item removed successfully", data: deleteProduct })
        }
        if (removeProduct == 1) {
            let reduceProduct = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": -1, totalPrice: -reducePrice } }, { new: true })
            return res.status(200).send({ status: true, messsage: "product removed successfully", data: reduceProduct })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

// *******************************************************GET CART***********************************************************

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })

        const userExist = await userModel.findById({ _id: userId })
        if (!userExist) return res.status(404).send({ status: false, message: "user not found.." })

        const isCartExist = await cartModel.findOne({ userId: userId })
        if (!isCartExist) return res.status(404).send({ status: false, message: "cart does not exist, create first.." })
        return res.status(200).send({ status: true, message: "your cart summary", data: isCartExist })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

// **********************************************DELETE CART**************************************************************

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })

        const userExist = await userModel.findById({ _id: userId })
        if (!userExist) return res.status(404).send({ status: false, message: "user not found.." })

        const isCartExist = await cartModel.findOne({ userId: userId })
        if (!isCartExist) return res.status(404).send({ status: false, message: "cart does not exist..." })

        await cartModel.findOneAndUpdate({ _id: isCartExist._id }, { items: [], totalPrice: 0, totalItems: 0 })
        return res.status(204).send()
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


module.exports = { createCart, updateCart, getCart, deleteCart }