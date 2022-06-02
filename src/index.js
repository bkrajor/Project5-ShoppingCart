const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const route = require('./routes/route')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(multer().any())

app.use('/', route)

mongoose.connect('mongodb+srv://bkrajor:Bk.190196@cluster0.bn0kl.mongodb.net/group6Database', { useNewUrlParser: true })
    .then(() => console.log('MongoDb is connected'))
    .catch(err => console.log(err))

app.listen(process.env.PORT || 3000, ()=>{
    console.log('Express app running on port'+ (process.env.PORT || 3000 ))}) 