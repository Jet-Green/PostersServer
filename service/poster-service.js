const PosterModel = require('../models/poster-model.js')
const UserModel = require('../models/user-model.js')
const { ObjectId } = require('mongoose')

module.exports = {
    async createPoster({ poster, user_id }) {
        const posterFromDb = await PosterModel.create(poster)

        await UserModel.findByIdAndUpdate(user_id, {
            $push: {
                posters: posterFromDb._id
            }
        })

        return posterFromDb._id.toString()
    },
    async findMany() {
        return PosterModel.find({})
    },
    async findById(_id) {
        return PosterModel.findById(_id)
    },
    async deleteOne(_id) {
        return PosterModel.deleteOne({ _id: _id })
    },
    async deleteMany() {
        return PosterModel.deleteMany({})
    },
}