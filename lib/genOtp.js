module.exports = digitCount => {
    
    let otp = ""
    for (let i = 0; i < digitCount; i++){
        otp += Math.floor(Math.random()*9)
    }
    
    return otp

}