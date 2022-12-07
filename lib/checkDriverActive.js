module.exports = (driverId, redisClient) => {

    return new Promise(async (resolve, reject) => {
        try {
            const activeTwoWheelerDriver = await redisClient.sendCommand([
                "GEOHASH",
                "active_two_wheeler_drivers",
                driverId
            ])
            const activeFourWheelerDriver = await redisClient.sendCommand([
                "GEOHASH",
                "active_four_wheeler_drivers",
                driverId
            ])
            let active = false
            if ((activeTwoWheelerDriver && activeTwoWheelerDriver[0]) || (activeFourWheelerDriver && activeFourWheelerDriver[0])){
                active = true
            }
            
            resolve({active})
        }
        catch (err){
            reject(err)
        }
    })

}