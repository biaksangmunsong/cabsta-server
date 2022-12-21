const geohash = require("ngeohash")

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
            let coords = null
            if (activeTwoWheelerDriver && activeTwoWheelerDriver[0]){
                coords = geohash.decode(activeTwoWheelerDriver[0])
            }
            else if (activeFourWheelerDriver && activeFourWheelerDriver[0]){
                coords = geohash.decode(activeFourWheelerDriver[0])
            }
            
            resolve({coords})
        }
        catch (err){
            reject(err)
        }
    })

}