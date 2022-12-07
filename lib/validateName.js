module.exports = name => {

    if (!name){
        return {
            error: {
                message: "Name is required"
            }
        }
    }
    else if (name.length < 4){
        return {
            error: {
                message: "Name too short"
            }
        }
    }
    else if (name.length > 50){
        return {
            error: {
                message: "Name too long"
            }
        }
    }
    else {
        return {
            error: null,
            name
        }
    }
    
}