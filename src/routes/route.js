const express = require('express')
const route = express.Router()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const { authentication, authorization } = require('../util/auth')

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ----------------User's APIs---------------
route.post('/register', userController.createUser)
route.post('/login', userController.userlogin)
route.get('/user/:userId/profile', authentication, userController.getUser)
route.put('/user/:userId/profile', authentication, authorization, userController.updateUser)

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ----------------Product's APIs-------------------
route.post('/products', productController.createProduct)
route.get('/products', productController.getProductByQuery)
route.get('/products/:productId', productController.getProductById)
route.put('/products/:productId', productController.updateProduct)
route.delete('/products/:productId', productController.deleteProduct)

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ----------------Cart's APIs-------------------
route.post('/users/:userId/cart',  cartController.createCart)
route.put('/users/:userId/cart', cartController.updateCart)
route.get('/users/:userId/cart',  cartController.getCart)
route.delete('/users/:userId/cart', cartController.deleteCart)

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ----------------Order's APIs-------------------
route.post('/users/:userId/orders', orderController.createOrder)
route.put('/users/:userId/orders ', orderController.updateOrder)

module.exports = route