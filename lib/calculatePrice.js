module.exports = distanceInMetres => {
    const pricing = JSON.parse(process.env.PRICING)
    
    const distanceInKm = Math.round(distanceInMetres/1000)
    let twoWheelerPrice = pricing.twoWheeler.base + pricing.twoWheeler.perKm*distanceInKm
    let fourWheelerPrice = pricing.fourWheeler.base + pricing.fourWheeler.perKm*distanceInKm
    
    if (distanceInKm > 3){
        const multiplier = distanceInKm-3
        const twoWheelerExtraPrice = pricing.twoWheeler.perKm*multiplier
        const fourWheelerExtraPrice = pricing.fourWheeler.perKm*multiplier
        
        twoWheelerPrice += twoWheelerExtraPrice
        fourWheelerPrice += fourWheelerExtraPrice
    }

    if (distanceInKm > 6){
        const multiplier = distanceInKm-6
        const twoWheelerExtraPrice = pricing.twoWheeler.perKm*multiplier
        const fourWheelerExtraPrice = pricing.fourWheeler.perKm*multiplier
        
        twoWheelerPrice += twoWheelerExtraPrice
        fourWheelerPrice += fourWheelerExtraPrice
    }
    
    return {
        twoWheeler: twoWheelerPrice,
        fourWheeler: fourWheelerPrice
    }
}