const posterModel = require("../models/poster-model")
const apiService = require('../service/api-service')
module.exports = {
    async getAll(req, res, next) {
        try {

        
            return res.json(await apiService.getAll(req.body.query))
        } catch (error) {
            next(error)
        }
    },
    async getTypes(req, res, next) {
         return  res.json(await apiService.getTypes())
    }
}