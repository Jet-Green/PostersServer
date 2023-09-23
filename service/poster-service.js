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
    async moderatePoster(_id, userId) {

        await UserModel.findByIdAndUpdate(userId, { $inc: { 'subscription.count': -1 } })
        // 2592000000 - 30 дней
        return PosterModel.findByIdAndUpdate(_id, {
            isModerated: true, rejected: false, publicationDate: Date.now(),
            endDate: Date.now() + 2592000000
        })
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
        poster.rejected = false
        poster.isModerated = false
        const posterFromDb = await PosterModel.create(poster)

        await UserModel.findByIdAndUpdate(user_id, {
            $push: {
                posters: posterFromDb._id
            }
        })

        return posterFromDb._id.toString()
    },
    async updatePoster(poster) {
        let _id = poster._id
        delete poster._id

        poster.isModerated = false
        poster.rejected = false

        let posterFromDb = await PosterModel.findOneAndUpdate({ _id }, poster, { new: true })
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
    async findMany(filter) {
        let { searchText, eventTime, eventType, eventSubtype, eventLocation, page } = filter
        const limit = 20;
        const sitePage = page;
        const skip = (sitePage - 1) * limit;
        let query = {
            $and: [
                { isHidden: false },
                { isModerated: true },
                { isDraft: false },
                { rejected: false, },
            ]
        }

        if (eventType) {
            query.$and.push({ eventType: eventType })
        }
        if (eventSubtype) {
            query.$and.push({ eventSubtype: eventSubtype })
        }
        // eventTime add



        if (eventLocation != "") {
            query.$and.push({ 'eventLocation.name': { $regex: eventLocation, $options: 'i' } })
        }
        if (searchText) {
            query.$and.push({
                $or: [
                    { title: { $regex: searchText, $options: 'i' } },
                    { description: { $regex: searchText, $options: 'i' } },
                    { organizer: { $regex: searchText, $options: 'i' } },
                ]
            })
        }

        const cursor = PosterModel.find(query, null).sort({ publicationDate: -1, date: -1 }).skip(skip).limit(limit).cursor();
       
        const results = [];
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            results.push(doc);
        }

        return results


    },
    async getById(_id) {
        return PosterModel.findById(_id)
    },
    async deleteOne(poster_id, email) {

        return await PosterModel.deleteOne({ _id: poster_id })
    },
    async findByIdAndHide(poster_id, isHidden) {

        return await PosterModel.findByIdAndUpdate(poster_id, { isHidden: isHidden })
    },
    async findByIdAndProlong({ _id, publicationStart, publicationEnd, userId }) {

        await UserModel.findByIdAndUpdate(userId, { $inc: { 'subscription.count': -1 } })
        return await PosterModel.findByIdAndUpdate(_id, { publicationDate: publicationStart, endDate: publicationEnd })
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
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, isModerated: true, isDraft: false, rejected: false, }] })
                break
            case 'onModeration':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, isModerated: false, isDraft: false, rejected: false, }] })
                break
            case 'archive':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, endDate: { $lt: Date.now() }, isModerated: true, isDraft: false, rejected: false, }] })
                break
            case 'draft':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, isDraft: true }] })
                break
            case 'rejected':
                posters = await PosterModel.find({ $and: [{ _id: { $in: userFromDb.posters }, rejected: true }] })
                break
        }
        return posters
    },
    async editPoster(poster, _id) {
        return PosterModel.findByIdAndUpdate(_id, poster)
    }
}