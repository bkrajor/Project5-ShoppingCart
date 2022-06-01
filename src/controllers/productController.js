const productModel = require('../models/productModel')
const { uploadFile } = require('../util/aws')
const {
    isValid, isValidBody, isValidObjectId, isValidName, isValidAvailableSizes, isValidPrice
} = require('../util/validator')

// *********************************************CREATE PRODUCT*******************************************************

const createProduct = async (req, res) => {
    try {
        let data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Invalid Parameters" })

        // ---------------DESTRUCTURING requestBody---------------------
        const { title, description, price, availableSizes } = data
        const currencyId = 'INR'
        const currencyFormat = '₹'

        // ------------------------VALIDATION starts from here-------------------------
        if (!title) return res.status(400).send({ status: false, message: "title is required" })
        if (!description) return res.status(400).send({ status: false, message: "description is required" })
        if (!price) return res.status(400).send({ status: false, message: "price is required" })
        if (!availableSizes) return res.status(400).send({ status: false, message: "size is required at least one size should be given" })

        if (!isValidName(title)) return res.status(400).send({ status: false, message: "title is invalid" })
        if (!isValid(description)) return res.status(400).send({ status: false, message: "description is invalid" })
        if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price is invalid" })
        // ------------------------VALIDATION ends here-------------------------

        if (!isValidAvailableSizes(availableSizes)) return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })

        // -------------------CHECKING uniqueness of title-----------------------
        const isTitleExist = await productModel.findOne({ title })
        if (isTitleExist) return res.status(400).send({ status: false, message: "Title is already exist" })

        // -----------------VALIDATING file from requestbody---------------------
        const files = req.files
        if (!(files && files.length > 0)) return res.status(400).send({ status: false, message: "Please provide profile picture" })
        let productPicUrl = await uploadFile(files[0])

        // ------------------ASSIGNING productImage,currencyId,currencyFormat to data object-------------- 
        data.productImage = productPicUrl
        data.currencyId = currencyId
        data.currencyFormat = currencyFormat

        const productData = await productModel.create(data)

        return res.status(201).send({ status: true, message: "Success", data: productData })
    }
    catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

// *********************************************GET PRODUCT BY QUERY****************************************************

const getProductByQuery = async (req, res) => {
    try {
        const filterQuery = { isDeleted: false}
        const data = req.query
        // -----------------DESTRUCTURING requestBody---------------------
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = data

        // ------------CHECKING and VALIDATING every key to get the product details------------
        if (size) {
            if (!isValidAvailableSizes(size)) return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
            filterQuery['availableSizes'] = size
        }
        if (name) {
            if (!isValidName(name)) return res.status(400).send({ status: false, message: 'name is invalid' })
            filterQuery['title'] = name
        }
        if (priceGreaterThan && priceLessThan) {
            if (!(isValidPrice(priceGreaterThan) || isValidPrice(priceLessThan))) return res.status(400).send({ status: false, message: "Price must be a valid number" })
            filterQuery['price'] = { $gte: priceGreaterThan, $lte: priceLessThan }
        }
        else if (priceGreaterThan) {
            if (!isValidPrice(priceGreaterThan)) return res.status(400).send({ status: false, message: "Price must be a valid number" })
            filterQuery['price'] = { $gte: priceGreaterThan }   
        }
        else if (priceLessThan) {
            if (!isValidPrice(priceLessThan)) return res.status(400).send({ status: false, message: "Price must be a valid number" })
            filterQuery['price'] = { $lte: priceLessThan }
        }
        if (priceSort) {
            console.log
            if (priceSort != 1 && priceSort != -1)
                return res.status(400).send({ status: false, message: "Please provide only 1 for ascending or -1 for descending" })
            if (priceSort == 1) {
                const products = await productModel.find(filterQuery).sort({ price: 1 })
                if (products.length == 0) return res.status(404).send({ status: false, message: 'No products found' })
                return res.status(200).send({ status: true, message: 'Success', data: products })
            }
            if (priceSort == -1) {
                const products = await productModel.find(filterQuery).sort({ price: -1 })
                if (!products.length) return res.status(404).send({ status: false, message: 'No products found' })
                return res.status(200).send({ status: true, message: 'Success', data: products })
            }
        }
        // -------------------------VALIDATION ends here-------------------------

        const products = await productModel.find(filterQuery) 
        if (!isValidBody(products)) return res.status(404).send({ status: false, message: 'No products found' })
        return res.status(200).send({ status: true, message: "Success", data: products })
    }
    catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

// *********************************************GET PRODUCT BY QUERY****************************************************

const getProductById = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId is invalid" })

        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(400).send({ status: false, message: "No product exist" })

        return res.status(200).send({ status: true, message: "Success", data: findProduct })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

// ************************************************UPDATE PRODUCT********************************************************

const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId is invalid" })

        let data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Please provide something to update" })

        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, message: "No Product exist" })

        // ---------------DESTRUCTURING requestBody---------------------
        const { title, description, price, availableSizes } = data

        // ------------CHECKING and VALIDATING every key to update the product details------------
        if (title)
            if (!isValidName(title)) return res.status(400).send({ status: false, message: "title is invalid" })
        if (description)
            if (!isValid(description)) return res.status(400).send({ status: false, message: "description is invalid" })
        if (price)
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price is invalid" })
        if (availableSizes)
            if (!isValidAvailableSizes(availableSizes)) return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
        // ----------------------VALIDATION ends here----------------------

        // -------------------CHECKING uniqueness of title---------------
        const isTitleExist = await productModel.findOne({ title })
        if (isTitleExist) return res.status(400).send({ status: false, message: "Title is already exist" })

        // --------CHECKING and VALIDATING file from requestbody-----------
        const files = req.files
        if (files && files.length > 0) {
            let profilePicUrl = await uploadFile(files[0])
            data.profileImage = profilePicUrl
        }

        const updatedProduct = await productModel.findByIdAndUpdate(productId, data, { new: true })

        return res.status(200).send({ status: true, message: "Product profile updated", data: updatedProduct })
    }
    catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

// *********************************************DELETE PRODUCT****************************************************

const deleteProduct = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId is  Invalid" })
        
        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, message: "This Product Data is already deleted Or Doesn't Exist" })
        
        let deleteproduct = await productModel.findOneAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date() }, { new: true })
        return res.status(200).send({ status: true, message: 'Success', data: deleteproduct })
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
}


module.exports = { createProduct, getProductByQuery, getProductById, updateProduct, deleteProduct }