module.exports = coords => {

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
    ){
        return false
    }
    
    return true
    
}