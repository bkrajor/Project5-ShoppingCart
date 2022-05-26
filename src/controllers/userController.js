const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const aws = require('aws-sdk')
const bcrypt = require('bcrypt')
const {
    isValid, isValidBody, isValidObjectId, isValidEmail, isValidPhone, isValidPassword, isValidName, isValidPincode
} = require('../validator/validator')
const { add } = require('nodemon/lib/rules')

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3({ apiVersion: '2006-03-01' })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "bharat/" + file.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) return reject({ "error": err })
            return resolve(data.Location)
        })
    })
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const createUser = async (req, res) => {
    try {
        let data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Invalid Parameters" })
        const { fname, lname, email, phone, password, address } = data
        const { shipping, billing } = address

        if (!fname) return res.status(400).send({ status: false, message: "first name is required" })
        if (!lname) return res.status(400).send({ status: false, message: "last name is required" })
        if (!email) return res.status(400).send({ status: false, message: "email is required" })
        if (!phone) return res.status(400).send({ status: false, message: "phone number is required" })
        if (!password) return res.status(400).send({ status: false, message: "password is required" })
        if (!address) return res.status(400).send({ status: false, message: "address is required" })

        if (!shipping) return res.status(400).send({ status: false, message: "shipping address is required" })
        if (!shipping.street) return res.status(400).send({ status: false, message: "street is required" })
        if (!shipping.city) return res.status(400).send({ status: false, message: "city is required" })
        if (!shipping.pincode) return res.status(400).send({ status: false, message: "pincode is required" })

        if (!billing) return res.status(400).send({ status: false, message: "billing address is required" })
        if (!billing.street) return res.status(400).send({ status: false, message: "street is required" })
        if (!billing.city) return res.status(400).send({ status: false, message: "city is required" })
        if (!billing.pincode) return res.status(400).send({ status: false, message: "pincode is required" })

        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "first name is invalid" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "last name is invalid" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email is invalid" })
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "phone is invalid" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is invalid" })
        if (!isValid(address)) return res.status(400).send({ status: false, message: "address is invalid" })

        if (!isValid(shipping)) return res.status(400).send({ status: false, message: "shipping address is invalid" })
        if (!isValid(shipping.street)) return res.status(400).send({ status: false, message: "street is invalid" })
        if (!isValidName(shipping.city)) return res.status(400).send({ status: false, message: "city is invalid" })
        if (!isValidPincode(shipping.pincode)) return res.status(400).send({ status: false, message: "pincode is invalid" })

        if (!isValid(billing)) return res.status(400).send({ status: false, message: "shipping address is invalid" })
        if (!isValid(billing.street)) return res.status(400).send({ status: false, message: "street is invalid" })
        if (!isValidName(billing.city)) return res.status(400).send({ status: false, message: "city is invalid" })
        if (!isValidPincode(billing.pincode)) return res.status(400).send({ status: false, message: "pincode is invalid" })

        const isEmailExist = await userModel.findOne({ email })
        if (isEmailExist) return res.status(400).send({ status: false, message: "Email is already exist" })

        const isPhoneExist = await userModel.findOne({ phone })
        if (isPhoneExist) return res.status(400).send({ status: false, message: "Phone number is already exist" })

        const files = req.files

        if (!(files && files.length > 0)) return res.status(400).send({ status: false, message: "Please provide profile picture" })
        let profilePicUrl = await uploadFile(files[0])

        data.password = bcrypt.hashSync(password, 10)

        data.profileImage = profilePicUrl
        const userData = await userModel.create(data)

        return res.status(201).send({ status: true, message: "User created successfully", data: userData })
    }
    catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const userlogin = async (req, res) => {
    try {
        let data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Enter the required details" })

        let { email, password } = data

        if (!email) return res.status(400).send({ status: false, message: "Provide the email" })
        if (!password) return res.status(400).send({ status: false, message: "provide the password" })

        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email is invalid" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is invalid" })

        let user = await userModel.findOne({ email })
        if (!user) return res.status(404).send({ status: false, message: "User is not found with this email" })

        let encryptedPassword = await bcrypt.compare(data.password, user.password)
        if (!encryptedPassword) return res.status(401).send({ status: false, message: "login failed! password is incorrect" })

        const token = await jwt.sign({ userId: user._id }, "Uranium Project-5", { expiresIn: "24h" });

        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: user._id, token: token } })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const getUser = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId is invalid" })

        let findProfile = await userModel.findById(userId)
        if (!findProfile) return res.status(400).send({ status: false, message: "No user exist" })

        return res.status(200).send({ status: true, message: "Profile found successfully.", data: findProfile })

    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const updateUser = async (req, res) => {
    try {
        let data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Please provide something to update" })

        const { fname, lname, email, phone, password, address } = data
        // const { shipping, billing } = address

        if (fname)
            if (!isValidName(fname)) return res.status(400).send({ status: false, message: "first name is invalid" })
        if (lname)
            if (!isValidName(lname)) return res.status(400).send({ status: false, message: "last name is invalid" })
        if (email)
            if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email is invalid" })
        if (phone)
            if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "phone is invalid" })
        if (password)
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is invalid" })

        if (address) {
            if (!isValid(address)) return res.status(400).send({ status: false, message: "address is invalid" })
            if (shipping) {
                if (!isValid(shipping)) return res.status(400).send({ status: false, message: "shipping address is invalid" })
                if (shipping.street)
                    if (!isValid(shipping.street)) return res.status(400).send({ status: false, message: "street is invalid" })
                if (shipping.city)
                    if (!isValidName(shipping.city)) return res.status(400).send({ status: false, message: "city is invalid" })
                if (shipping.pincode)
                    if (!isValidPincode(shipping.pincode)) return res.status(400).send({ status: false, message: "pincode is invalid" })
            }
            if (billing) {
                if (!isValid(billing)) return res.status(400).send({ status: false, message: "shipping address is invalid" })
                if (billing.street)
                    if (!isValid(billing.street)) return res.status(400).send({ status: false, message: "street is invalid" })
                if (billing.city)
                    if (!isValidName(billing.city)) return res.status(400).send({ status: false, message: "city is invalid" })
                if (billing.pincode)
                    if (!isValidPincode(billing.pincode)) return res.status(400).send({ status: false, message: "pincode is invalid" })
            }
        }

        const isEmailExist = await userModel.findOne({ email })
        if (isEmailExist) return res.status(400).send({ status: false, message: "Email is already exist" })

        const isPhoneExist = await userModel.findOne({ phone })
        if (isPhoneExist) return res.status(400).send({ status: false, message: "Phone number is already exist" })

        if (password) {
            data.password = await bcrypt.hash(password, 10)
        }

        const files = req.files

        if (files && files.length > 0) {
            let profilePicUrl = await uploadFile(files[0])
            data.profileImage = profilePicUrl
        }

        const updatedProfile = await userModel.findByIdAndUpdate(userId, data, { new: true })

        return res.status(200).send({ status: true, message: "User profile updated", data: updatedProfile })

    }
    catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

module.exports = { createUser, userlogin, getUser, updateUser }