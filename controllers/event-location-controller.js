const EventLocationService = require('../service/event-location-service')

module.exports = {
    async getAll(req, res, next) {
        try {
            return res.json(await EventLocationService.getAll())
        } catch (error) {
            next(error)
        }
    }
}