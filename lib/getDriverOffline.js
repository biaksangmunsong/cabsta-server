module.exports = (driverId, redisClient) => {

    return new Promise(async (resolve, reject) => {
        try {
            await redisClient.sendCommand([
                "ZREM",
                "active_two_wheeler_drivers",
                driverId
            ])
            await redisClient.sendCommand([
                "ZREM",
                "active_four_wheeler_drivers",
                driverId
            ])
            
            resolve(true)
        }
        catch (err){
            reject(err)
        }
    })

}