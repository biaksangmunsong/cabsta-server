const jwt = require("jsonwebtoken")
const User = require("../db-models/User")

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
        const data = jwt.verify(token, process.env.JWT_SECRET)
        const redisClient = req.redisClient
        
        let jwtValidFrom = null
        
        // try to get data from redis
        jwtValidFrom = await redisClient.sendCommand([
            "GET",
            `users:jwt_valid_from:${data.userId}`
        ])

        if (jwtValidFrom){
            // if data is in redis use that data
            jwtValidFrom = Number(jwtValidFrom)
        }
        else {
            // if data is not in redis, get it from database
            const user = await User.findOne({_id: data.userId})
            if (user){
                jwtValidFrom = user.jwtValidFrom
                
                // if data is found in database, add it to redis
                await redisClient.sendCommand([
                    "SETEX",
                    `users:jwt_valid_from:${data.userId}`,
                    "604800",
                    String(user.jwtValidFrom)
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
        req.userId = data.userId
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