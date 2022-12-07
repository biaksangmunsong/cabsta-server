module.exports = (pickupLocationLat, pickupLocationLng, destinationLat, destinationLng) => {

    // validate pickupLocation and destination
    if (
        typeof(pickupLocationLat) !== "number" ||
        typeof(pickupLocationLng) !== "number" ||
        typeof(destinationLat) !== "number" ||
        typeof(destinationLng) !== "number"
    ){
        return {
            status: 406,
            data: {
                message: "Invalid input"
            }
        }
    }
    
    if (
        (
            (!pickupLocationLat && pickupLocationLat !== 0) ||
            (!pickupLocationLng && pickupLocationLng !== 0) ||
            (!destinationLat && destinationLat !== 0) ||
            (!destinationLng && destinationLng !== 0)
        ) ||
        (
            pickupLocationLat < -85 ||
            pickupLocationLat > 85 ||
            pickupLocationLng < -180 ||
            pickupLocationLng > 180 ||
            destinationLat < -85 ||
            destinationLat > 85 ||
            destinationLng < -180 ||
            destinationLng > 180
        )
    ){
        return {
            status: 406,
            data: {
                message: "Invalid input"
            }
        }
    }

    // make sure pickup location and destination are different
    if (
        pickupLocationLat === destinationLat &&
        pickupLocationLng === destinationLng
    ){
        return {
            status: 406,
            data: {
                message: "Pickup Location and Destination should not be the same."
            }
        }
    }
    
    return {
        status: 200
    }

}