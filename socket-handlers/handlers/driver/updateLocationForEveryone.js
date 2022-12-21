const validateCoords = require("../../../lib/validateCoords")

module.exports = async (coords, driverId, redisClient) => {
    
    try {
        if (!validateCoords(coords)) return
        
        // update location
        await redisClient.sendCommand([
            "GEOADD",
            "active_drivers",
            "XX",
            String(coords.lng),
            String(coords.lat),
            driverId
        ])
    }
    catch {}

}