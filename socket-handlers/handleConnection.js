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

                let driver = null

                // try to get driver data from redis
                driver = await redisClient.sendCommand([
                    "GET",
                    `drivers:${tokenData.driverId}`
                ])

                if (driver){
                    // if driver data is in redis use that data
                    driver = JSON.parse(driver)
                }
                else {
                    // if driver data is not in redis, get it from database
                    driver = await Driver.findOne({_id: tokenData.driverId})
                    if (driver){
                        // if driver is found in database, add it to redis
                        await redisClient.sendCommand([
                            "SETEX",
                            `drivers:${tokenData.driverId}`,
                            "60",
                            JSON.stringify(driver.toJSON())
                        ])
                    }
                }
                
                if (driver && driver.jwtValidFrom && tokenData.iat){
                    if (tokenData.iat >= driver.jwtValidFrom){
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