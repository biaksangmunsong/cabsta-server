const jwt = require("jsonwebtoken")
const Driver = require("../db-models/Driver")
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
                            "60",
                            String(driver.jwtValidFrom)
                        ])
                    }
                }
                
                if (jwtValidFrom && tokenData.iat){
                    if (tokenData.iat >= jwtValidFrom){
                        socket.on("update-driver-location-for-everyone", coords => {
                            updateDriverLocationForEveryone(coords, tokenData.driverId, redisClient)
                        })
                    }
                }
            }
        }
        catch {}
    }
    
}