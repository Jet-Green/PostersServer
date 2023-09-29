const PosterModel = require('../models/poster-model.js')
const UserModel = require('../models/user-model.js')
const EventLocationModel = require('../models/event-location-model.js');
const EventLogService = require('../service/event-log-service')

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

        //! перед тем как вычесть нужно проверить есть ли оплаченные афишы, если нет сообщить об этом на клиенте 
        await UserModel.findByIdAndUpdate(userId, { $inc: { 'subscription.count': -1 } })
        // for log
        let setEvent = {}
        setEvent._id = userId
        await PosterModel.find({ _id: _id }).then((data) => { setEvent.name = data[0].title })
        await EventLogService.setPostersLog(setEvent)

        // 2592000000 - 30 дней
        return PosterModel.findByIdAndUpdate(_id, {
            isModerated: true, rejected: false, publicationDate: Date.now(),
            endDate: Date.now() + 2592000000
        })
    },
    async createDraft({ poster, userId }) {
        let { eventLocation } = poster
        let city = eventLocation.city_with_type
        let settlement = eventLocation.settlement_with_type
        let region = eventLocation.region_with_type
        let area = eventLocation.area_with_type
        let capital_marker = eventLocation.capital_marker
        let location = ''
        // не удалять пробелы в строках
        if (region && capital_marker != 2 && region != city) {
            location = `${region}, `
        }
        if (city) {
            location = `${location}${city}`
        }
        if (area) {
            location = `${location}${area}`
        }
        if (settlement) {
            location = `${location}, ${settlement}`
        }
        // не удалять пробелы в строках

        let candidateEventLocationInDB = await EventLocationModel.findOne({ name: location })
        if (!candidateEventLocationInDB && location) {
            await EventLocationModel.create({ name: location })
        }

        poster.eventLocation.name = eventLocation.name

        poster.isDraft = true
        poster.isModerated = false
        poster.rejected = false
        const posterFromDb = await PosterModel.create(poster)

        await UserModel.findByIdAndUpdate(userId, {
            $push: {
                posters: posterFromDb._id
            }
        })
        return posterFromDb._id.toString()
    },
    async createPoster({ poster, user_id }) {
        let { eventLocation } = poster
        let city = eventLocation.city_with_type
        let settlement = eventLocation.settlement_with_type
        let region = eventLocation.region_with_type
        let area = eventLocation.area_with_type
        let capital_marker = eventLocation.capital_marker
        let location = ''
        // не удалять пробелы в строках
        if (region && capital_marker != 2 && region != city) {
            location = `${region}, `
        }
        if (city) {
            location = `${location}${city}`
        }
        if (area) {
            location = `${location}${area}`
        }
        if (settlement) {
            location = `${location}, ${settlement}`
        }
        // не удалять пробелы в строках

        let candidateEventLocationInDB = await EventLocationModel.findOne({ name: location })
        if (!candidateEventLocationInDB) {
            await EventLocationModel.create({ name: location })
        }

        poster.eventLocation.name = eventLocation.name
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
        let update = await PosterModel.findByIdAndUpdate(posterId, { image: filename })

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

        let setEvent = {}
        setEvent._id = userId
        await PosterModel.find({ _id: _id }).then((data) => { setEvent.name = data[0].title })
        await EventLogService.prolongPostersLog(setEvent)

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
            return PosterModel.find({ rejected: true, isDraft: false }).sort({ publicationDate: -1 })
        } else {
            return PosterModel.find({ isModerated: false, rejected: false, isDraft: false }).sort({ publicationDate: -1 })
        }
    },
    async getPosters({ user_id, poster_status }) {
        let userFromDb = await UserModel.findById(user_id)
        let posters = []
        switch (poster_status) {
            case 'active':
                posters = await PosterModel
                    .find({ $and: [{ _id: { $in: userFromDb.posters }, isModerated: true, isDraft: false, rejected: false, }] })
                    .sort({ publicationDate: -1 })
                break
            case 'onModeration':
                posters = await PosterModel
                    .find({ $and: [{ _id: { $in: userFromDb.posters }, isModerated: false, isDraft: false, rejected: false, }] })
                    .sort({ publicationDate: -1 })
                break
            case 'archive':
                posters = await PosterModel
                    .find({ $and: [{ _id: { $in: userFromDb.posters }, endDate: { $lt: Date.now() }, isModerated: true, isDraft: false, rejected: false, }] })
                    .sort({ publicationDate: -1 })
                break
            case 'draft':
                posters = await PosterModel
                    .find({ $and: [{ _id: { $in: userFromDb.posters }, isDraft: true }] })
                    .sort({ publicationDate: -1 })
                break
            case 'rejected':
                posters = await PosterModel
                    .find({ $and: [{ _id: { $in: userFromDb.posters }, rejected: true, isDraft: false }] })
                    .sort({ publicationDate: -1 })
                break
        }
        return posters
    },
    async editPoster(poster, _id) {
        let posterFromDb = await PosterModel.findById(_id)

        Object.assign(posterFromDb, poster)

        posterFromDb.isDraft = false
        posterFromDb.isModerated = false
        posterFromDb.rejected = false

        return posterFromDb.save()
    }
}