module.exports = async (coords, driverId, redisClient) => {
    
    try {
        if (typeof(coords) !== "object") return
        
        const lat = Number(coords.lat) || NaN
        const lng = Number(coords.lng) || NaN

        // validate latitude and longitude input
        if (
            (
                !lat ||
                !lng
            ) ||
            (
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            )
        ) return
        
        // update location
        await redisClient.sendCommand([
            "GEOADD",
            "active_drivers_location",
            String(lng),
            String(lat),
            driverId
        ])
    }
    catch {}

}