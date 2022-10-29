const jwt = require("jsonwebtoken")
const Driver = require("../db-models/Driver")
const updateDriverLocationForEveryone = require("./handlers/driver/updateLocationForEveryone")

module.exports = async (io, socket) => {
    
    const authToken = socket.handshake.headers.authorization.split("Bearer ")[1]
    const client = socket.handshake.headers.client
    
    if (authToken && client){
        // verify authorization token
        try {
            if (client === "driver"){
                const tokenData = jwt.verify(authToken, process.env.DRIVER_JWT_SECRET)
                const driver = await Driver.findOne({driverId: tokenData.driverId})
                if (driver && driver.jwtValidFrom && tokenData.iat){
                    if (tokenData.iat >= driver.jwtValidFrom){
                        socket.on("update-driver-location-for-everyone", updateDriverLocationForEveryone)
                    }
                }
            }
        }
        catch {}
    }
    
}