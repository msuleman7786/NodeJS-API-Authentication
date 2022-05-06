// // Adding the Controller pattern & Clean up :- https://youtu.be/k_NX6t6YP0I

const createError = require("http-errors")

const User = require("../Models/user")
const { authSchema } = require("../Helpers/validationSchema")
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../Helpers/jwt_helper")
const client = require("../Helpers/initRedis")



module.exports = {
    register: async(req, res, next) => {
        try {
            // const {email, password} = req.body
            // if(!email || !password) throw createError.BadRequest()
            const result = await authSchema.validateAsync(req.body)
    
            // User Exist
            const doesExist = await User.findOne({email: result.email})
            if(doesExist) throw createError.Conflict(`${result.email} is already been registered`)
    
            // User not exits then Create User
            const user = new User(result)
            const savedUser = await user.save()
            // JWT Token
            const accessToken = await signAccessToken(savedUser.id)                 // await is use bcoz we create promise in jwt_helper
            const refreshToken = await signRefreshToken(savedUser.id)
    
            res.send({ accessToken, refreshToken })                                 // {} use to get result in json "key: value" e.g:- {accessToken: "token"}
    
        } catch (error) {
            // changing the error status code (currenty it showing 500 Internal Server Error which is wrong)
            if(error.isJoi === true) error.status = 422
            next(error)
        }
    },

    login: async(req, res, next)=> {
        // // Loggin in users :- https://youtu.be/XM60tZ4lBWA
        try {
            const result = await authSchema.validateAsync(req.body)
            const user = await User.findOne({ email: result.email })
            if(!user) throw createError.NotFound("User not registered")
    
            // Matching the database credential with login input credential
            const isMatch = await user.isValidPassword(result.password)                     // line 35 from user.js
            if(!isMatch) throw createError.Unauthorized("Username/Password not valid")
    
            // Create new access token
            const accessToken = await signAccessToken(user.id)
            const refreshToken = await signRefreshToken(user.id)
    
            res.send({ accessToken, refreshToken })
        }
        catch(error) {
            if(error.isJoi === true)
            return next(createError.BadRequest("Invalid Username/Password"))
            next (error)
        }
    },

    refreshToken: async(req, res, next)=> {
        // // Using Refresh Tokens to generate New tokens :- https://youtu.be/e5arKkbhEyE
        try {
            const { refreshToken } = req.body
            if(!refreshToken) throw createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)
    
            const accessToken = await signAccessToken(userId)
            const refToken = await signRefreshToken(userId)                         // can't use refreshToken word bcoz it already declare in try{}
    
            res.send({ accessToken: accessToken, refreshToken: refToken })
        } catch (error) {
            next(error)
        }
    },

    logout: async(req, res, next)=> {
        // // Logout User :- https://youtu.be/YKssGmLig0o
        try {
            const { refreshToken } = req.body;
            if(!refreshToken) throw createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)
            // Redis
            client.DEL(userId, (err, val) => {
                if(err) {
                    console.log(err.message)
                    throw createError.InternalServerError()
                }
                console.log(val)
                res.sendStatus(204)
            })
        } catch (error) {
            next(error)
        }
    }
}