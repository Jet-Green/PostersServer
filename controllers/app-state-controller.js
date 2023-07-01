const appStateService = require('../service/app-state-service')

module.exports = {
    async getState(req, res, next) {
        try {
            return res.json(await appStateService.getAppState())
        } catch (error) {
            next(error)
        }
    },
    async addEventType(req, res, next) {
        try {
            return res.json(await appStateService.addEventType(req.body.newEventType))
        } catch (error) {
            next(error)
        }
    },
    async deleteEventType(req, res, next) {
        try {
            return res.json(await appStateService.deleteEventType(req.body.eventType))
        } catch (error) {
            next(error)
        }
    }
}