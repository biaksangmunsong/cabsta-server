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
        const driver = await Driver.findOne({_id: data.driverId})
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
            phoneNumber: data.phoneNumber,
            countryCode: data.countryCode,
            name: data.name,
            dob: data.dob,
            gender: data.gender,
            vehicleType: data.vehicleType,
            vehicle: data.vehicle
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