const PriceService = require('../service/price-service')

module.exports = {
    async create(req, res, next) {
        try {
            console.log(req.body);
            return res.json(await PriceService.create(req.body))
        } catch (error) {
            next(error)
        }
    },
}