const express = require('express')
const route = express.Router()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const { authentication, authorization } = require('../middleware/auth')

route.post('/register', userController.createUser)
route.post('/login', userController.userlogin)
route.get('/user/:userId/profile', authentication, userController.getUser)
route.put('/user/:userId/profile', authentication, authorization, userController.updateUser)

// Product APIs
route.post('/products', productController.createProduct)
route.get('/products', productController.getProductByQuery)
route.get('/products/:productId', productController.getProductById)
route.put('/products/:productId', productController.updateProduct)
route.delete('/products/:productId', productController.deleteProduct)


module.exports = route