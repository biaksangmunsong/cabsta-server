const jwt = require("jsonwebtoken")

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