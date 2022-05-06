                    // User Model using mongoose :- https://youtu.be/-ByHuH9pPgk

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

// // Hashing Password using bcrypt :- https://youtu.be/rYdhfm4m7yg
userSchema.pre("save", async function(next) {
    try {
        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
    } catch (error) {
        next(error)
    }
})

// // Loggin in users :- https://youtu.be/XM60tZ4lBWA
// Matching the database credential with login input credential
userSchema.methods.isValidPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
}


// Create a User
const User = mongoose.model('user', userSchema)


module.exports = User;