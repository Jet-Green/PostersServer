const PosterModel = require('../models/poster-model.js')
const UserModel = require('../models/user-model.js')
const EventLocationModel = require('../models/event-location-model.js')

module.exports = {
    async createPoster({ poster, user_id }) {
        let { eventLocation } = poster

        let candidateEventLocationInDB = await EventLocationModel.findOne({ name: eventLocation.name })
        if (candidateEventLocationInDB) {
            poster.eventLocation = candidateEventLocationInDB
        } else {
            poster.eventLocation = await EventLocationModel.create(eventLocation)
        }

        const posterFromDb = await PosterModel.create(poster)

        await UserModel.findByIdAndUpdate(user_id, {
            $push: {
                posters: posterFromDb._id
            }
        })

        return posterFromDb._id.toString()
    },
    async updatePoster(poster) {
        let posterFromDb = await PosterModel.findOneAndUpdate({ _id: poster._id }, poster, { new: true })
        return posterFromDb._id
    },
    async updateImageUrl(posterId, filename) {
        return PosterModel.findByIdAndUpdate(posterId, { $set: { image: filename } })
    },
    async findMany() {
        return PosterModel.find({})
    },
    async getById(_id) {
        return PosterModel.findById(_id)
    },
    async deleteOne(poster_id, email) {
        let user = await UserModel.findOne({ email: email })
        for (let i = 0; i < user.posters.length; i++) {
            if (user.posters[i]._id.toString() == poster_id.toString()) {
                user.posters.splice(i, 1)
            }
        }

        user.markModified('posters')

        await user.save()
        return await PosterModel.deleteOne({ _id: poster_id })
    },
    async deleteMany() {
        return PosterModel.deleteMany({})
    },
}