const OrdService = require('../service/ord-service')

module.exports = {

    async getOrganisation(req, res, next) {
        try {
            return res.json(await OrdService.getOrdState())
        } catch (error) {
            next(error)
        }
    },


    async createOrganisation(req, res, next) {
        try {

            return res.json(await OrdService.createOrganisation(req.body))

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






}


