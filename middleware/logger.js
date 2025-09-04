// @description      Logs request data to the console
// @route            All routes
// @access           Public

const logger = (req, res, next) =>{
    console.log(
        `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`)
}

module.exports = logger;