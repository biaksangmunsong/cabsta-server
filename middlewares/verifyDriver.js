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
        
        const driverData = driver.toJSON()
        req.driverId = driverData._id
        req.driverData = {
            phoneNumber: driverData.phoneNumber,
            countryCode: driverData.countryCode,
            name: driverData.name,
            dob: driverData.dob,
            gender: driverData.gender,
            vehicleType: driverData.vehicleType,
            vehicle: driverData.vehicle
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