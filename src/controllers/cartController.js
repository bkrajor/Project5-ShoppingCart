const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const { isValidObjectId, isValid } = require('../util/validator')

// *********************************************CREATE CART**************************************************** 

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let productId = req.body.productId

        let productDetails = { productId, quantity: 1 }

        // ----------------VALIDATING productId and then CHECKING product in DB----------------  
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "productId is required" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid product Id.." })
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(400).send({ status: false, message: "product not found or may be deleted..." })

        const productPrice = product.price

        // -------------CHECKING cart is already present for  user or not------------
        const isCartExist = await cartModel.findOne({ userId: userId })

        if (isCartExist) {
            let alreadyProductsId = isCartExist.items.map(x => x.productId.toString())
            if (alreadyProductsId.includes(productId)) {
                let updatedCart = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": 1, totalPrice: productPrice } }, { new: true })
                return res.status(200).send({ status: true, message: "items added successfully", data: updatedCart })
            }
            else {
                let updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, { $push: { items: productDetails }, $inc: { totalItems: 1, totalPrice: productPrice } }, { new: true })
                return res.status(200).send({ status: true, message: "items added successfully", data: updatedCart })
            }
        }

        // -----------If cart is not present then creating new CART for user----------
        const cartCreate = {
            userId: userId,
            items: [productDetails],
            totalItems: 1,
            totalPrice: productPrice
        }
        const cartCreated = await cartModel.create(cartCreate)
        return res.status(201).send({ status: true, message: "cart created successfully", data: cartCreated })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

// *********************************************UPDATE CART****************************************************

const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId

        // ---------------DESTRUCTURING bodyData---------------
        const { cartId, productId, removeProduct } = req.body

        // ------------------------VALIDATION starts from here-------------------------
        if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Provide cartId " })
        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Provide productId " })
        if (!isValid(removeProduct)) return res.status(400).send({ status: false, message: "Provide removeProduct field" })

        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "invalid cart Id.." })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid product Id.." })
        // ---------------------------VALIDATION ends here------------------------------

        // -------------CHECKING cart is already present for user or not------------
        const isCartExist = await cartModel.findOne({ $or: [{ _id: cartId }, { userId: userId }] })
        if (!isCartExist) return res.status(404).send({ status: false, message: "cart does not exist.." })
        if (isCartExist.items.length == 0) return res.status(404).send({ status: false, message: "No Product Present In the Cart" })

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, message: "product details not found or may be deleted" })

        // -------------CHECKING cartData with particular productId------------
        const cartData = await cartModel.findOne({ "items.productId": productId, _id: cartId })
        if (!cartData) return res.status(404).send({ status: false, message: "This Product not present in the following Cart" })

        // -------------ASSIGNING price and quantity fot the product-----------
        const price = findProduct.price
        const quantity = cartData.items.filter(x => x.productId.toString() === productId)[0].quantity 

        if (removeProduct != 0 && removeProduct != 1) return res.status(400).send({ status: false, message: "remove Product should contain 0 and 1 only.." })

        if (removeProduct == 0) {
            const deleteProduct = await cartModel.findOneAndUpdate({ "items.productId": productId, cartId: cartId },
                { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -price * quantity } }, { new: true })
            return res.status(200).send({ status: true, messsage: "item removed successfully", data: deleteProduct })
        }
        if (removeProduct == 1) {
            if (quantity > 1) {
                let reduceProduct = await cartModel.findOneAndUpdate({ "items.productId": productId, cartId: cartId },  
                    { $inc: { "items.$.quantity": -1, totalPrice: -price } }, { new: true })
                return res.status(200).send({ status: true, messsage: "product removed successfully", data: reduceProduct })
            }
            else {
                const deleteProduct = await cartModel.findOneAndUpdate({ "items.productId": productId, cartId: cartId },
                    { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -price } }, { new: true })
                return res.status(200).send({ status: true, messsage: "item removed successfully", data: deleteProduct })
            }
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

// *********************************************GET CART****************************************************

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId

        const isCartExist = await cartModel.findOne({ userId: userId })
        if (!isCartExist) return res.status(404).send({ status: false, message: "cart does not exist, create first.." })
        return res.status(200).send({ status: true, message: "your cart summary", data: isCartExist })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

// *********************************************DELETE CART****************************************************

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId

        const isCartExist = await cartModel.findOne({ userId: userId })
        if (!isCartExist) return res.status(404).send({ status: false, message: "cart does not exist..." })

        const cartDeleted = await cartModel.findOneAndUpdate({ _id: isCartExist._id }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        return res.status(204).send({ status: true, message: "your cart is empty..continue shopping", data: cartDeleted })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


module.exports = { createCart, updateCart, getCart, deleteCart }