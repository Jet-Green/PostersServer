const appStateService = require('../service/app-state-service')

module.exports = {
    async getState(req, res, next) {
        try {
            return res.json(await appStateService.getAppState())
        } catch (error) {
            next(error)
        }
    }
}