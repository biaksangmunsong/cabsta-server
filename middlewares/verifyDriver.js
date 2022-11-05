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
        const redisClient = req.redisClient
        const data = jwt.verify(token, process.env.DRIVER_JWT_SECRET)

        let driver = null

        // try to get driver data from redis
        driver = await redisClient.sendCommand([
            "GET",
            `drivers:${data.driverId}`
        ])

        if (driver){
            // if driver data is in redis use that data
            driver = JSON.parse(driver)
        }
        else {
            // if driver data is not in redis, get it from database
            driver = await Driver.findOne({_id: data.driverId})
            if (driver){
                // if driver is found in database, add it to redis
                await redisClient.sendCommand([
                    "SETEX",
                    `drivers:${data.driverId}`,
                    "60",
                    JSON.stringify(driver.toJSON())
                ])
            }
        }

        if (!driver || !driver.jwtValidFrom || !data.iat){
            return next({
                status: 403,
                data: {
                    message: "Access denied"
                }
            })
        }
        if (data.iat < driver.jwtValidFrom){
            return next({
                status: 401,
                data: {
                    code: "credential-expired",
                    message: "Credentials expired, please sign in again."
                }
            })
        }
        
        req.driverId = data.driverId
        req.driverData = {
            phoneNumber: driver.phoneNumber,
            countryCode: driver.countryCode,
            name: driver.name,
            dob: driver.dob,
            gender: driver.gender,
            vehicleType: driver.vehicleType,
            vehicle: driver.vehicle
        }
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