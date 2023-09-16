const PosterModel = require('../models/poster-model.js')
const UserModel = require('../models/user-model.js')
const EventLocationModel = require('../models/event-location-model.js');

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
    async rejectPoster({ _id, message }) {
        return PosterModel.findByIdAndUpdate(_id, { moderationMessage: message, rejected: true })
    },
    async moderatePoster(_id, value) {
        return PosterModel.findByIdAndUpdate(_id, { isModerated: value, rejected: false })
    },
    async createPoster({ poster, user_id }) {
        let { eventLocation } = poster

        let candidateEventLocationInDB = await EventLocationModel.findOne({ name: eventLocation.name })
        if (candidateEventLocationInDB) {
            poster.eventLocation = candidateEventLocationInDB
        } else {
            poster.eventLocation = await EventLocationModel.create(eventLocation)
        }
        poster.isDraft = false
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
        if (!posterFromDb) {
            posterFromDb = await PosterModel.findById(posterId)
        }
        if (posterFromDb.image) {
            let spl = posterFromDb.image.split('/')
            let result = await s3.Remove('/plakat-city/' + spl[spl.length - 1])
        }

        let uploadResult = await s3.Upload(buffer, '/plakat-city/');
        let filename = uploadResult.Location
        let update = await PosterModel.findByIdAndUpdate(posterId, { $set: { image: filename } })

        if (!update) {
            await PosterModel.findByIdAndUpdate(posterId, { $set: { image: filename } })
        }

        return filename
    },
    async findMany(filters) {
        let { eventLocation } = filters
        let query = { $and: [{ isHidden: false }, { isModerated: true }] }
        if (eventLocation) {
            query.$and.push({ 'eventLocation.name': eventLocation })
        }
        if (filters.searchText) {
            query.$and.push({
                $or: [
                    { title: { $regex: filters.searchText, $options: 'i' } },
                    { description: { $regex: filters.searchText, $options: 'i' } },
                    { organizer: { $regex: filters.searchText, $options: 'i' } },
                    { site: { $regex: filters.searchText, $options: 'i' } },
                    { phone: { $regex: filters.searchText, $options: 'i' } },
                    { email: { $regex: filters.searchText, $options: 'i' } },
                    { eventType: { $regex: filters.searchText, $options: 'i' } },
                ]
            })
        }
        if (filters.eventType) {
            query.$and.push({
                $or: [
                    { eventType: { $regex: filters.eventType, $options: 'i' } },
                ]
            })
        }

        return PosterModel.find(query)
    },
    async getById(_id) {
        return PosterModel.findById(_id)
    },
    async deleteOne(poster_id, email) {
   
        return await PosterModel.deleteOne({ _id: poster_id })
    },
    deleteMany() {
        return PosterModel.deleteMany({})
    },
    getUserPosters(postersIds) {
        return PosterModel.find({ _id: { $in: postersIds } })
    },
    getPostersOnModeration(status) {
        if (status == 'rejected') {
            return PosterModel.find({ rejected: true })
        } else {
            return PosterModel.find({ isModerated: false, rejected: false })
        }
    },
    async createDraft({ poster, userId }) {
        let { eventLocation } = poster
        let candidateEventLocationInDB = await EventLocationModel.findOne({ name: eventLocation.name })
        if (candidateEventLocationInDB) {
            poster.eventLocation = candidateEventLocationInDB
        } else {
            poster.eventLocation = await EventLocationModel.create(eventLocation)
        }
        poster.isDraft = true
        const posterFromDb = await PosterModel.create(poster)

        await UserModel.findByIdAndUpdate(userId, {
            $push: {
                posters: posterFromDb._id
            }
        })
        return posterFromDb._id.toString()
    },
    async getPosters({ user_id, poster_status }) {
        let userFromDb = await UserModel.findById(user_id)
        let posters = []
        switch (poster_status) {
            case 'active':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, isModerated: true, isDraft: false,  }] })
                break
            case 'onModeration':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, isModerated: false, isDraft: false, }] })
                break
            case 'archive':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, endDate: { $lt: Date.now() } }] }) // надо убирать в архив если endDate
                break
            case 'draft':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, isDraft: true }] })
                break
            case 'rejected':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, rejected: true }] })
                break
        }
        return posters
    }
}