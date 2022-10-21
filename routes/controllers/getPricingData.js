module.exports = (req, res, next) => {
    
    try {
        // send response
        res
        .status(200)
        .set("Cache-Control", "no-store")
        .json(JSON.parse(process.env.PRICING))
    }
    catch (err){
        console.log(err)
        next({
            status: 500,
            message: "Internal Server Error"
        })
    }

}