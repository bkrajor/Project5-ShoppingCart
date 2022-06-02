const express = require('express')
const route = express.Router()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const { authentication, authorization } = require('../util/auth')

// *********************************USER's APIs*********************************************

route.post('/register', userController.createUser)
route.post('/login', userController.userlogin)
route.get('/user/:userId/profile', authentication, userController.getUser)
route.put('/user/:userId/profile', authentication, authorization, userController.updateUser)

// *******************************PRODUCT's APIs********************************************

route.post('/products', productController.createProduct)
route.get('/products', productController.getProductByQuery)
route.get('/products/:productId', productController.getProductById)
route.put('/products/:productId', productController.updateProduct)
route.delete('/products/:productId', productController.deleteProduct)

// *********************************CART's APIs**********************************************

route.post('/users/:userId/cart', authentication, authorization, cartController.createCart)
route.put('/users/:userId/cart', authentication, authorization, cartController.updateCart)
route.get('/users/:userId/cart', authentication, cartController.getCart)
route.delete('/users/:userId/cart', authentication, authorization, cartController.deleteCart)

// *********************************ORDER's APIs**********************************************

route.post('/users/:userId/orders', authentication, authorization, orderController.createOrder)
route.put('/users/:userId/orders ', authentication, authorization, orderController.updateOrder)

module.exports = route