module.exports = length => {
    
    if (!length){
        length = 20
    }
    const string = "1aAbB2cCd3DeEf4FgG5hHi6Ij7JkK8lL9mM0nNo1Op2PqQ3rR4sSt5TuUvV6wWx7XyYz8Z90"
    let uid = ""
    
    for (let i = 0; i < length; i++){
        const randomNumber = Math.floor(Math.random() * (string.length-1))
        uid += string[randomNumber]
    }
    
    return uid

}