const PriceModel = require('../models/price-model.js')

module.exports = {
    async create(form) {
        return PriceModel.create(form)
    },
    async getAll(){
        return PriceModel.find()
    },
}