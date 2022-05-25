const express = require('express')
const route = express.Router()
const userController = require('../controllers/userController')

route.post('/register', userController.createUser)
route.post('/login', userController.userlogin)
route.get('/user/:userId/profile', userController.getUser)
route.put('/user/:userId/profile', userController.updateUser)


module.exports = route