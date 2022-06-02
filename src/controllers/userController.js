const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { uploadFile } = require('../util/aws')
const {
 isValid, isValidBody, isValidObjectId, isValidEmail, isValidPhone, isValidPassword, isValidName, isValidPincode
} = require('../util/validator')

// ******************************************************CREATE USER************************************************************

const createUser = async (req, res) => {
    try {
        let data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Invalid Parameters" })

        // ---------------DESTRUCTURING requestBody---------------------
        const { fname, lname, email, phone, password, address } = data

        // ------------------------VALIDATION starts from here-------------------------
        if (!isValid(fname)) return res.status(400).send({ status: false, message: "first name is required" })
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "last name is required" })
        if (!isValid (email)) return res.status(400).send({ status: false, message: "email is required" })
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone number is required" })
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })
        if (!isValid(address)) return res.status(400).send({ status: false, message: "address is required" })

        // ---------------DESTRUCTURING address---------------------
        const { shipping, billing } = address

        if (!isValid(shipping)) return res.status(400).send({ status: false, message: "shipping address is required" })
        if (!isValid(shipping.street)) return res.status(400).send({ status: false, message: "street is required" })
        if (!isValid(shipping.city)) return res.status(400).send({ status: false, message: "city is required" })
        if (!isValid(shipping.pincode)) return res.status(400).send({ status: false, message: "pincode is required" })

        if (!isValid(billing)) return res.status(400).send({ status: false, message: "billing address is required" })
        if (!isValid(billing.street)) return res.status(400).send({ status: false, message: "street is required" })
        if (!isValid(billing.city)) return res.status(400).send({ status: false, message: "city is required" })
        if (!isValid(billing.pincode)) return res.status(400).send({ status: false, message: "pincode is required" })

        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "first name is invalid" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "last name is invalid" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email is invalid" })
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "phone number is invalid" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is invalid" })

        if (!isValidName(shipping.city)) return res.status(400).send({ status: false, message: "city is invalid" })
        if (!isValidPincode(shipping.pincode)) return res.status(400).send({ status: false, message: "pincode is invalid" })

        if (!isValidName(billing.city)) return res.status(400).send({ status: false, message: "city is invalid" })
        if (!isValidPincode(billing.pincode)) return res.status(400).send({ status: false, message: "pincode is invalid" })
        // --------------------------VALIDATION ends here----------------------------------

        // -------------------CHECKING uniqueness of email & phone-----------------------
        const isEmailExist = await userModel.findOne({ email })
        if (isEmailExist) return res.status(400).send({ status: false, message: "Email is already exist" })

        const isPhoneExist = await userModel.findOne({ phone })
        if (isPhoneExist) return res.status(400).send({ status: false, message: "Phone number is already exist" })

        // --------VALIDATING file from requestbody-----------
        let files = req.files
        if (!(files && files.length > 0)) return res.status(400).send({ status: false, message: "Please provide profile picture" })
        let profileImageUrl = await uploadFile(files[0])

        // -------ASSIGNING encrypted password & profileImageUrl to data object-----------
        data.password = bcrypt.hashSync(password, 10)
        data.profileImage = profileImageUrl

        const userData = await userModel.create(data)

        return res.status(201).send({ status: true, message: "User created successfully", data: userData })
    }
    catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

// ******************************************************USER LOGIN************************************************************

const userlogin = async (req, res) => {
    try {
        let data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Enter the required details" })

        // ---------DESTRUCTURING email & password---------
        let { email, password } = data

        // ------------------------VALIDATION starts from here-------------------------
        if (!isValid(email)) return res.status(400).send({ status: false, message: "Provide the email" })
        if (!isValid(password)) return res.status(400).send({ status: false, message: "provide the password" })

        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email is invalid" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is invalid" })
        // ----------------------------VALIDATION ends here----------------------------

        let user = await userModel.findOne({ email })
        if (!user) return res.status(404).send({ status: false, message: "User is not found with this email" })

        // ----------COMPARING encrypted password with user's entered password---------
        if (!(bcrypt.compare(password, user.password))) return res.status(401).send({ status: false, message: "login failed! password is incorrect" })

        const token = jwt.sign({ userId: user._id }, "Uranium Project-5", { expiresIn: "24h" });

        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: user._id, token: token } })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

// ******************************************************GET USER************************************************************

const getUser = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId is invalid" })

        let findProfile = await userModel.findById(userId)
        if (!findProfile) return res.status(400).send({ status: false, message: "No user exist" })

        return res.status(200).send({ status: true, message: "Profile found successfully.", data: findProfile })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

// ******************************************************UPDATE USER************************************************************

const updateUser = async (req, res) => {
    try {
        let data = req.body
        const userId = req.params.userId
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Please provide something to update" })

        // ---------------DESTRUCTURING requestBody---------------------
        const { fname, lname, email, phone, password, address } = data

        // ------------CHECKING and VALIDATING every key to update the data------------
        if (fname)
            if (!isValidName(fname)) return res.status(400).send({ status: false, message: "first name is invalid" })
        if (lname)
            if (!isValidName(lname)) return res.status(400).send({ status: false, message: "last name is invalid" })
        if (email)
            if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email is invalid" })
        if (phone)
            if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "phone is invalid" })
        if (password) {
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password is invalid" })
            data.password = await bcrypt.hash(password, 10)
        }
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
        // -----------------------------VALIDATING ends here-------------------------------------
        
        // -------------------CHECKING uniqueness of email & phone-----------------------
        const isEmailExist = await userModel.findOne({ email })
        if (isEmailExist) return res.status(400).send({ status: false, message: "Email is already exist" })

        const isPhoneExist = await userModel.findOne({ phone })
        if (isPhoneExist) return res.status(400).send({ status: false, message: "Phone number is already exist" })

        // --------CHECKING and VALIDATING file from requestbody-----------
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