module.exports = (distanceInMetres, basePrice, perKmPrice) => {
    const distanceInKm = Math.round(distanceInMetres/1000)
    let twoWheelerPrice = basePrice.two_wheeler
    let fourWheelerPrice = basePrice.four_wheeler

    for (let i = Math.floor(perKmPrice[0].from/1000); i < distanceInKm+(Math.floor(perKmPrice[0].from/1000)); i++){
        if (i <= Math.floor(perKmPrice[0].to/1000)){
            twoWheelerPrice += perKmPrice[0].two_wheeler
            fourWheelerPrice += perKmPrice[0].four_wheeler
        }
        else if (i > Math.floor(perKmPrice[0].to/1000) && i <= Math.floor(perKmPrice[1].to/1000)){
            twoWheelerPrice += perKmPrice[1].two_wheeler
            fourWheelerPrice += perKmPrice[1].four_wheeler
        }
        else {
            twoWheelerPrice += perKmPrice[2].two_wheeler
            fourWheelerPrice += perKmPrice[2].four_wheeler
        }
    }
    
    return {
        two_wheeler: twoWheelerPrice,
        four_wheeler: fourWheelerPrice
    }
}