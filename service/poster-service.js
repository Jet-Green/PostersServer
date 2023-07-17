const PosterModel = require('../models/poster-model.js')
const UserModel = require('../models/user-model.js')
const EventLocationModel = require('../models/event-location-model.js')
let EasyYandexS3 = require('easy-yandex-s3').default;

// Указываем аутентификацию в Yandex Object Storage
let s3 = new EasyYandexS3({
    auth: {
        accessKeyId: process.env.YC_KEY_ID,
        secretAccessKey: process.env.YC_SECRET,
    },
    Bucket: process.env.YC_BUCKET_NAME, // Название бакета
    debug: false, // Дебаг в консоли
});

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
    async updateImageUrl(req) {
        let buffer = {
            buffer: req.files[0].buffer, name: req.files[0].originalname,
        }
        let posterId = req.query.poster_id

        let posterFromDb = await PosterModel.findById(posterId)

        if (posterFromDb.image) {
            let spl = posterFromDb.image.split('/')
            let result = await s3.Remove('/plakat-city/' + spl[spl.length - 1])
        }

        let uploadResult = await s3.Upload(buffer, '/plakat-city/');
        let filename = uploadResult.Location

        await PosterModel.findByIdAndUpdate(posterId, { $set: { image: filename } })

        return filename
    },
    async findMany(filters) {
        console.log(filters)
        let { eventLocation } = filters
        let query = { $and: [{ isHidden: false }, { isModerated: true }] }
        if (eventLocation) {
            query.$and.push({ 'eventLocation.name': eventLocation })
        }

        return PosterModel.find(query)
    },
    async getById(_id) {
        return PosterModel.findById(_id)
    },
    async deleteOne(poster_id, email) {
        // let user = await UserModel.findOne({ email: email })
        // for (let i = 0; i < user.posters.length; i++) {
        //     if (user.posters[i]._id.toString() == poster_id.toString()) {
        //         user.posters.splice(i, 1)
        //     }
        // }

        // user.markModified('posters')

        // await user.save()
        return await PosterModel.deleteOne({ _id: poster_id })
    },
    deleteMany() {
        return PosterModel.deleteMany({})
    },
    getUserPosters(postersIds) {
        return PosterModel.find({ _id: { $in: postersIds } })
    },
    getPostersOnModeration() {
        return PosterModel.find({ isModerated: false })
    }
}