const AppStateModel = require('../models/app-state-model');
const posterModel = require("../models/poster-model")

module.exports = {
    async getAll(filter) {
        let {  eventType, eventLocation } = filter
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
                eventType: eventType
            })
        }
        if (eventLocation != "") {
            query.$and.push({ 'eventLocation.name': { $regex: eventLocation, $options: 'i' } })
        }
       

        return await posterModel.find(query, null).sort({ publicationDate: -1, date: -1 })
    },

    async getTypes() {
        let eventTypes = await AppStateModel.find({}, { eventTypes: 1 })
        return eventTypes[0]
    }
}