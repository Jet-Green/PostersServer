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
    async addEventSubtype(req, res, next) {
        try {
            let category_name = req.body.category_name
            let subcategory_name = req.body.subcategory_name

            return res.json(await appStateService.addEventSubtype(category_name, subcategory_name))
        } catch (error) {
            next(error)
        }
    },
    async deleteEventSubtype(req, res, next) {
        try {
            let category_name = req.body.category_name
            let subcategory_name = req.body.subcategory_name

            return res.json(await appStateService.deleteEventSubtype(category_name, subcategory_name))
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
    },
    async getUsers(req, res, next) {
        try {
            return res.json(await appStateService.getUsers())
        } catch (error) {
            next(error)
        }
    },
    /**
    * body {
    * email: user email
    * role: manager-${city id}
    * }
    */
    async userToManager(req, res, next) {
        try {
            return res.json(await appStateService.userToManager(req.body))
        } catch (error) {
            next(error)
        }
    },
    /**
    * body {
    * userId
    * }
    */
    async managerToUser(req, res, next) {
        try {
            return res.json(await appStateService.managerToUser(req.body.userId))
        } catch (error) {
            next(error)
        }
    },
    async getManagers(req, res, next) {
        try {
            return res.json(await appStateService.getManagers())
        } catch (error) {
            next(error)
        }
    }
}