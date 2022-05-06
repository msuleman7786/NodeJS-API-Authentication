                                        // Generate JWT Access Token :- https://youtu.be/O4ej9Sr7F4M

const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("./initRedis");

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((res, rej)=> {                       // created own Promise bcoz jwt not have promise and works only callback
            const payload = {
                // iss: "pickurpage.com"                        // Login in users :- https://youtu.be/XM60tZ4lBWA?t=750
            }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: "1y",                               // JWT time conversion detail :- https://github.com/vercel/ms
                issuer: "pickurpage.com",                       // issuer is use for token create time
                audience: userId
            }

            jwt.sign(payload, secret, options, (err, token)=> {
                if(err) {
                    console.log(err.message)
                    rej(createError.InternalServerError())
                }
                res(token)
            })
        })
    },
    // // Verifyting an Access Token using a middleware :- https://youtu.be/BnN3TQOG5-g
    verifyAccessToken: (req, res, next) => {
        if(!req.headers['authorization'])
        return next(createError.Unauthorized())

        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')                           // To split the token and bearer (rest.http :- http://localhost:3000)
        const token = bearerToken[1]                                        // 0 contain bearer & 1 contain token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload)=> {
            if(err) {
                // // Handling JWT Errors :- https://youtu.be/NxANrLx59Cc
                const message = err.name==='JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })
    },



    // // Generating Refresh Tokens :- https://youtu.be/tI_k0wQufKc
    signRefreshToken: (userId) => {
        return new Promise((res, rej)=> {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: "1y",
                issuer: "pickurpage.com",
                audience: userId
            }

            jwt.sign(payload, secret, options, (err, token)=> {
                if(err) {
                    console.log(err.message)
                    rej(createError.InternalServerError())
                }

                // // Blacklisting Refresh Tokens using Redis :- https://youtu.be/ssypjWFdD4E
                // Redis command will work with small & capital both
                client.SET(userId, token, 'EX', 30, (err, reply) => {                 // EX = expire time, 1yr = 365*24*60*60
                    if(err) {
                        console.log(err.message)
                        rej(createError.InternalServerError())
                        return
                    }
                    res(token)
                })
            })
        })
    },
    // // Using Refresh Tokens to generate New tokens :- https://youtu.be/e5arKkbhEyE?t=199
    verifyRefreshToken: (refreshToken) => {
        return new Promise((res, rej) => {                                                          // return a new Promise bcoz jwt doesn't have promises in-build
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if(err)
                return rej(createError.Unauthorized())

                const userId = payload.aud                                                          // write only aud not audience bcoz payload contains shortform of audience

                // // Using Refresh Tokens to generate New tokens
                client.GET(userId, (err, result) => {
                    if(err) {
                        console.log(err.message)
                        rej(createError.InternalServerError())
                        return
                    }
                })
                if(refreshToken === result)
                return res(userId)
                rej(createError.Unauthorized())
            })
        })
    }
}