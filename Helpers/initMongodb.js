                    // Mongoose Connecting to MongoDB :- https://youtu.be/JLwwQMU6Ru0

const mongoose = require("mongoose");

// Connect
mongoose.connect(process.env.MONGODB_URI, {dbName: process.env.DB_NAME})
.then(()=> {
    console.log("mongodb connected")
})
.catch((err)=> console.log(err.message))

// Connect Event / CallBack
mongoose.connection.on("connected", ()=> {
    console.log("Mongoose connected to db")
})

// Error Event
mongoose.connection.on("error", (err)=> {
    console.log(err.message)
})

// Disconnect Event
mongoose.connection.on("disconnected", ()=> {
    console.log(" Mongoose connection is disconnected")
})

// Close Mongoose (SIGINT Event)
process.on("SIGINT", async()=> {                                    // SIGINT Event will fire when we press ctrl+c
    await mongoose.connection.close();
    process.exit(0)
})