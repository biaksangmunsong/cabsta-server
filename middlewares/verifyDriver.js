const jwt = require("jsonwebtoken")
const Driver = require("../db-models/Driver")

module.exports = async (req, res, next) => {
    
    if (!req.headers.authorization){
        return next({
            status: 403,
            data: {
                message: "Access denied"
            }
        })
    }
    
    const token = req.headers.authorization.split("Bearer ")[1]
    
    // verify token
    try {
        const data = jwt.verify(token, process.env.DRIVER_JWT_SECRET)
        const redisClient = req.redisClient
        
        let jwtValidFrom = null
        
        // try to get data from redis
        jwtValidFrom = await redisClient.sendCommand([
            "GET",
            `drivers:jwt_valid_from:${data.driverId}`
        ])

        if (jwtValidFrom){
            // if data is in redis use that data
            jwtValidFrom = Number(jwtValidFrom)
        }
        else {
            // if data is not in redis, get it from database
            const driver = await Driver.findOne({_id: data.driverId})
            if (driver){
                jwtValidFrom = driver.jwtValidFrom
                
                // if data is found in database, add it to redis
                await redisClient.sendCommand([
                    "SETEX",
                    `drivers:jwt_valid_from:${data.driverId}`,
                    "60",
                    String(driver.jwtValidFrom)
                ])
            }
        }
        
        if (!jwtValidFrom || !data.iat){
            return next({
                status: 403,
                data: {
                    message: "Access denied"
                }
            })
        }
        if (data.iat < jwtValidFrom){
            return next({
                status: 401,
                data: {
                    code: "credential-expired",
                    message: "Credentials expired, please sign in again."
                }
            })
        }
        
        req.driverId = data.driverId
        next()
    }
    catch {
        next({
            status: 403,
            data: {
                message: "Access denied"
            }
        })
    }

}