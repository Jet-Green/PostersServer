const apiTokenModel = require("../models/api-token-model")
const posterModel = require("../models/poster-model")

module.exports = {
    async getAll(req, res, next) {
        res.json(await posterModel.find())
    }
}