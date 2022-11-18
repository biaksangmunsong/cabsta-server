module.exports = dobMillis => {

    const thisYear = new Date().getFullYear()
    const dobYear = new Date(dobMillis).getFullYear()

    return thisYear-dobYear

}