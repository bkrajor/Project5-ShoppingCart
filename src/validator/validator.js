const mongoose = require('mongoose')

const isValid = (value) => {
    if (typeof value == 'undefined' || value == null) return false
    if (typeof value == 'string' && value.trim().length == 0) return false
    if (typeof value == 'number' && value.toString().trim().length == 0) return false
    return true
}

const isValidBody = (body) => {
    return Object.keys(body).length > 0
}

const isValidObjectId = (objectId) => {
    return mongoose.isValidObjectId(objectId)
}

const isValidEmail = (email) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

const isValidPhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone)
}

const isValidPassword = (password) => {
    return /^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password)
}

const isValidName = (name) => {
    return /^[a-zA-Z ]{3,30}$/.test(name)
}

const isValidPincode = (pincode) => {
    return /^[1-9]\d{5}$/.test(pincode)
}

const isValidAvailableSizes = (size) => {
    return ["S", "XS","M","X", "L","XXL", "XL"].indexOf(size) !== -1
}
const isValidPrice = (price) => {
    return /^\d{0,8}[.]?\d{1,4}$/.test(price)
}

const isValidQuantity = function isInteger(value) {
    if (value < 1) return false
    if (isNaN(Number(value))) return false
    if (value % 1 == 0) return true
}

module.exports = { 
    isValid, isValidBody, isValidObjectId, isValidEmail, isValidPhone, isValidPassword, isValidName, isValidPincode, isValidAvailableSizes, isValidPrice, isValidQuantity
}