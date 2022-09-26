const express = require("express")
const app = express()
const routes = require("./routes/routes")
const mongoose = require("mongoose")
const cloudinary = require("cloudinary").v2
require("dotenv").config()

const PORT = process.env.PORT || 8080

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
app.use("/", routes)

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
}).then(() => {
    // initialize firebase
    // initializeApp({
    //     credential: cert(serviceAccount)
    // })
    
    //configure cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUDNAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    })
    
    // listen to port
    app.listen(PORT, () => {
        console.log(`Server running at port ${PORT}...`)
    })
})