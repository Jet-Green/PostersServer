const PriceService = require('../service/price-service')

module.exports = {
    async create(req, res, next) {
        try {
            return res.json(await PriceService.create(req.body))
        } catch (error) {
            next(error)
        }
    },
    async getAll(req, res, next) {
        try {
            return res.json(await PriceService.getAll(req.body))
        } catch (error) {
            next(error)
        }
    }
}