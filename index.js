const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const io = require("socket.io")(server, {cors: {origin: "*"}})
const routes = require("./routes/routes")
const handleSocketConnection = require("./socket-handlers/handleConnection")
const mongoose = require("mongoose")
const { initializeApp, cert } = require("firebase-admin/app")
const cloudinary = require("cloudinary").v2
const { createClient } = require("redis")
require("dotenv").config()

const PORT = process.env.PORT || 8080

const redisClient = createClient()

// handle redis error
redisClient.on("error", err => {
    console.log(`Redis Error: ${err.message}`)
})

// apply middlewares
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({limit: "50mb", extended: true}))
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    next()
})

// handle routes
app.use("/v1", (req, res, next) => {
    req.redisClient = redisClient
    routes(req, res, next)
})

// handle errors
app.use((err, req, res, next) => {
    if (err){
        res
        .status(err.status)
        .set("Cache-Control", "no-store")
        .json(err.data)
    }
    else {
        res.end()
    }
})

// connect to mongodb
mongoose.connect(process.env.MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(async () => {
    // initialize firebase
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    initializeApp({
        credential: cert(serviceAccount)
    })
    
    //configure cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUDNAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    })

    // init redis
    await redisClient.connect()

    // listen to port
    server.listen(PORT, () => {
        console.log(`Server running at port ${PORT}...`)
        
        io.on("connection", socket => handleSocketConnection(io, socket, redisClient))
    })
}).catch(err => {
    console.log(err)
})