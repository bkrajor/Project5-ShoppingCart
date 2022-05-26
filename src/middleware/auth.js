const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const authentication = async function (req, res, next) {
    try {
        const token = req.header('Authorization', 'Bearer Token')
        if (!token)
        return res.status(400).send({ status: false, msg: "token is required" })
        
        const newToken = token.split(' ');
        const finalToken = newToken[1];
        let decodedToken = jwt.verify(finalToken, "Uranium Project-5")
        if (!decodedToken)
            return res.status(401).send({ status: false, msg: "please enter the right token" })

        req.userId = decodedToken.userId
        next()
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 

const authorization = async function (req, res, next) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId is invalid" })

        const user = await userModel.findById(userId)
        if (!user)
            return res.status(404).send({ status: false, message: " user not found" })

        if (req.userId !== userId)
            return res.status(403).send({ status: false, message: "unauthorized access" })
        next()
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

module.exports = { authentication, authorization }