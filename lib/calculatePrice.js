module.exports = distanceInMetres => {
    const pricing = JSON.parse(process.env.PRICING)
    
    const distanceInKm = Math.round(distanceInMetres/1000)
    let twoWheelerPrice = pricing.twoWheeler.base
    let fourWheelerPrice = pricing.fourWheeler.base

    for (let i = 1; i < distanceInKm+1; i++){
        if (i <= 3){
            twoWheelerPrice += pricing.twoWheeler.perKm[0]
            fourWheelerPrice += pricing.fourWheeler.perKm[0]
        }
        else if (i > 3 && i <= 6){
            twoWheelerPrice += pricing.twoWheeler.perKm[1]
            fourWheelerPrice += pricing.fourWheeler.perKm[1]
        }
        else {
            twoWheelerPrice += pricing.twoWheeler.perKm[2]
            fourWheelerPrice += pricing.fourWheeler.perKm[2]
        }
    }
    
    return {
        twoWheeler: twoWheelerPrice,
        fourWheeler: fourWheelerPrice
    }
}