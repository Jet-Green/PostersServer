const PosterModel = require('../models/poster-model.js')

module.exports = {
    async createPoster(poster){
        return PosterModel.create(poster)
    },
    async getAllElements(type) {
        return PosterModel.find({ 'type': type }).exec()
    },
    async findById(_id) {
        return PosterModel.findById(_id)
    },
    async deleteOne(_id) {
        return PosterModel.deleteOne({_id: _id})
    },
    async deleteMany() {
        return PosterModel.deleteMany({})
    },
}