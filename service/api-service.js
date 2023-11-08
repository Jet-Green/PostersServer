const AppStateModel = require('../models/app-state-model');
const posterModel = require("../models/poster-model")

module.exports = {
    async getAll(filter) {
        let { eventType, eventLocation } = filter
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
        if (eventLocation != "") {
            query.$and.push({ 'eventLocation.name': { $regex: eventLocation, $options: 'i' } })
        }
        query.$and.push(
            {
                $or: [
                    { date: { $eq: [], } },
                    { date: { $gt: new Date().setHours(0, 0, 0, 0), } }
                ]
            })

        return await posterModel.find(query, null).sort({ publicationDate: -1, date: -1 })
    },

    async getTypes() {
        let eventTypes = await AppStateModel.find({}, { eventTypes: 1 })
        return eventTypes[0]
    }
}