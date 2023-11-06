const OrdService = require('../service/ord-service')

module.exports = {
    async getOrganization(req, res, next) {
        try {
            return res.json(await OrdService.getOrdState())
        } catch (error) {
            next(error)
        }
    },
    async createOrganization(req, res, next) {
        try {
            return res.json(await OrdService.createOrganization(req.body))
        } catch (error) {
            next(error)
        }
    },
    async createContract(req, res, next) {
        try {
            return res.json(await OrdService.createContract(req.body))
        } catch (error) {
            next(error)
        }
    },
    async createPlatform(req, res, next) {
        try {
            let platformFromDb = await OrdService.createPlatform(req.body)
            let platformId = platformFromDb._id

            req.body.platforms[0].platformId = platformId

            return res.json(await OrdService.platforms(req.body))
        } catch (error) {
            next(error)
        }
    }
}