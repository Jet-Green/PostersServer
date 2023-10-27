const PosterModel = require('../models/poster-model.js')
const UserModel = require('../models/user-model.js')
const EventLocationModel = require('../models/event-location-model.js');
const EventLogService = require('../service/event-log-service')
const UserService = require('../service/user-service')

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
        let res = await UserService.subscriptionCount({ _id: userId })
        if (res.subscription.count) {
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

        } else {
            return false
        }

    },
    async createDraft({ poster, userId }) {
        let { eventLocation } = poster
        if (eventLocation) {

            let city = eventLocation.city_with_type
            let settlement = eventLocation.settlement_with_type
            let region = eventLocation.region_with_type
            let area = eventLocation.area_with_type
            let capital_marker = eventLocation.capital_marker
            let location = ''
            //! не удалять пробелы в строках
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
            //! не удалять пробелы в строках

            let candidateEventLocationInDB = await EventLocationModel.findOne({ name: location })
            if (!candidateEventLocationInDB && location) {
                await EventLocationModel.create({ name: location })
            }

            poster.eventLocation.name = eventLocation.name
        }

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
        //! не удалять пробелы в строках
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
        //! не удалять пробелы в строках

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
            await s3.Remove(process.env.IMG_PLACE + spl[spl.length - 1])
        }

        let uploadResult = await s3.Upload(buffer, process.env.IMG_PLACE);
        let filename = uploadResult.Location
        let update = await PosterModel.findByIdAndUpdate(posterId, { image: filename })

        if (!update) {
            await PosterModel.findByIdAndUpdate(posterId, { $set: { image: filename } })
        }

        return filename
    },
    async findMany(filter) {
        let { searchText, date, eventType, eventSubtype, eventLocation, page } = filter
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
        if (eventType?.length) {
            query.$and.push({
                eventType: { $in: eventType }
            })
        }
        if (eventSubtype?.length) {
            query.$and.push({ eventSubtype: { $in: eventSubtype } })
        }
        switch (date) {
            case 'Сегодня':
                query.$and.push({
                    date:
                    {
                        $gt: new Date().setHours(0, 0, 0, 0),
                        $lt: new Date().setHours(23, 59, 59, 999)
                    }
                })
                break
            case 'На неделе':
                query.$and.push({
                    date:
                    {
                        $gt: new Date().setHours(0, 0, 0, 0),
                        $lt: new Date().setHours(23, 59, 59, 999) + 1000 * 60 * 60 * 24 * 7
                    }
                })
                break
            case 'Скоро':
                query.$and.push(
                    {
                        date:
                        {
                            $gt: new Date().setHours(0, 0, 0, 0) + 1000 * 60 * 60 * 24 * 8,
                            $lt: new Date().setHours(23, 59, 59, 999) + 1000 * 60 * 60 * 24 * 14
                        }
                    })
                break
            // default:
            //     query.$and.push(
            //         {
            //             date:
            //             {
            //                 $gt: new Date().setHours(0, 0, 0, 0),
            //             }
            //         })
        }



        if (eventLocation != "") {
            query.$and.push({ 'eventLocation.name': { $regex: eventLocation, $options: 'i' } })
        }
        if (searchText) {
            query.$and.push({
                $or: [
                    { title: { $regex: searchText, $options: 'i' } },
                    { description: { $regex: searchText, $options: 'i' } },
                    { organizer: { $regex: searchText, $options: 'i' } },
                    { eventType: { $regex: searchText, $options: 'i' } },
                    { eventSubtype: { $regex: searchText, $options: 'i' } },
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
    async find(filter) {
        return PosterModel.find(filter)
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