                            // NodeJS API Authentication (JWT's) :- https://youtube.com/playlist?list=PLdHg5T0SNpN0ygjV4yGXNct25jY_ue70U
                            // type npm start in terminal to run nodemon as we declare it inside scripts (package.json)

const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();

const Mongo = require("./Helpers/initMongodb")
const { verifyAccessToken } = require("./Helpers/jwt_helper")

const client = require("./Helpers/initRedis")

const authRoute = require("./Routes/auth")

const app = express()
app.use(morgan("dev"))                              // It use to see api request in console too
app.use(express.json())                             // to access json data
app.use(express.urlencoded({extended: true}))       // to access form data

// API
app.get("/", verifyAccessToken, async(req, res, next)=> {
    res.send("Hello from express.")
})

// Use Routes
app.use("/auth", authRoute)

// Create a new Error :- for Normal method (without any error package) watch from 13:00
app.use(async(req, res, next)=> {
    // createError.NotFound("This is error") to display specific message
    next(createError.NotFound())
})

// Error handling
app.use((err, req, res, next)=> {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const port = process.env.PORT || 4000
app.listen(port, ()=> {
    console.log(`Server running on port ${port}`)
})