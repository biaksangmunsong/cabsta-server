const jwt = require("jsonwebtoken")
const User = require("../db-models/User")
const Driver = require("../db-models/Driver")
const abortARideRequest = require("./handlers/abortARideRequest")
const updateDriverLocationForEveryone = require("./handlers/driver/updateLocationForEveryone")

module.exports = async (io, socket, redisClient) => {

    if (!socket.handshake.headers.authorization) return
    
    const authToken = socket.handshake.headers.authorization.split("Bearer ")[1]
    const client = socket.handshake.headers.client
    
    if (authToken && client){
        // verify authorization token
        try {
            if (client === "driver"){
                const tokenData = jwt.verify(authToken, process.env.DRIVER_JWT_SECRET)

                let jwtValidFrom = null
                
                // try to get data from redis
                jwtValidFrom = await redisClient.sendCommand([
                    "GET",
                    `drivers:jwt_valid_from:${tokenData.driverId}`
                ])

                if (jwtValidFrom){
                    // if data is in redis use that data
                    jwtValidFrom = Number(jwtValidFrom)
                }
                else {
                    // if data is not in redis, get it from database
                    const driver = await Driver.findOne({_id: tokenData.driverId})
                    if (driver){
                        jwtValidFrom = driver.jwtValidFrom
                        
                        // if data is found in database, add it to redis
                        await redisClient.sendCommand([
                            "SETEX",
                            `drivers:jwt_valid_from:${tokenData.driverId}`,
                            "604800",
                            String(driver.jwtValidFrom)
                        ])
                    }
                }
                
                if (jwtValidFrom && tokenData.iat){
                    if (tokenData.iat >= jwtValidFrom){
                        socket.join(tokenData.driverId)
                        
                        socket.on("update-driver-location-for-everyone", coords => {
                            updateDriverLocationForEveryone(coords, tokenData.driverId, redisClient)
                        })
                    }
                }
            }
            if (client === "passenger"){
                const tokenData = jwt.verify(authToken, process.env.JWT_SECRET)

                let jwtValidFrom = null
                
                // try to get data from redis
                jwtValidFrom = await redisClient.sendCommand([
                    "GET",
                    `users:jwt_valid_from:${tokenData.userId}`
                ])

                if (jwtValidFrom){
                    // if data is in redis use that data
                    jwtValidFrom = Number(jwtValidFrom)
                }
                else {
                    // if data is not in redis, get it from database
                    const user = await User.findOne({_id: tokenData.userId})
                    if (user){
                        jwtValidFrom = user.jwtValidFrom
                        
                        // if data is found in database, add it to redis
                        await redisClient.sendCommand([
                            "SETEX",
                            `users:jwt_valid_from:${tokenData.userId}`,
                            "604800",
                            String(user.jwtValidFrom)
                        ])
                    }
                }
                
                if (jwtValidFrom && tokenData.iat){
                    if (tokenData.iat >= jwtValidFrom){
                        socket.join(tokenData.userId)
                        
                        socket.on("abort-a-ride-request", driverId => {
                            abortARideRequest(driverId, redisClient, socket)
                        })
                        socket.on("broadcast-driver-unresponsive", driverId => {
                            socket.broadcast.emit("driver-available", driverId)
                        })
                    }
                }
            }
        }
        catch {}
    }
    
}