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
        const user = await User.findOne({_id: data.userId})
        if (!user || !user.jwtValidFrom || !data.iat){
            return next({
                status: 403,
                data: {
                    message: "Access denied"
                }
            })
        }
        if (data.iat < user.jwtValidFrom){
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