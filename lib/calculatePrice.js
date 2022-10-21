module.exports = (distanceInMetres, basePrice, perKmPrice) => {
    const distanceInKm = Math.round(distanceInMetres/1000)
    let twoWheelerPrice = basePrice.twoWheeler
    let fourWheelerPrice = basePrice.fourWheeler

    for (let i = Math.floor(perKmPrice[0].from/1000); i < distanceInKm+(Math.floor(perKmPrice[0].from/1000)); i++){
        if (i <= Math.floor(perKmPrice[0].to/1000)){
            twoWheelerPrice += perKmPrice[0].twoWheeler
            fourWheelerPrice += perKmPrice[0].fourWheeler
        }
        else if (i > Math.floor(perKmPrice[0].to/1000) && i <= Math.floor(perKmPrice[1].to/1000)){
            twoWheelerPrice += perKmPrice[1].twoWheeler
            fourWheelerPrice += perKmPrice[1].fourWheeler
        }
        else {
            twoWheelerPrice += perKmPrice[2].twoWheeler
            fourWheelerPrice += perKmPrice[2].fourWheeler
        }
    }
    
    return {
        twoWheeler: twoWheelerPrice,
        fourWheeler: fourWheelerPrice
    }
}