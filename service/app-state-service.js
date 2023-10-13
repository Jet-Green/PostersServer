const AppStateModel = require('../models/app-state-model');
const UserModel = require('../models/user-model');

module.exports = {
    async getAppState() {
        let allStates = await AppStateModel.find({})
        if (allStates.length == 0) {
            return await AppStateModel.create({})
        }
        return allStates[0]
    },
    addEventType(newEventType) {
        return AppStateModel.findOneAndUpdate({}, { $push: { eventTypes: { name: newEventType, subcategories: [] } } })
    },
    async addEventSubtype(eventType, newEventSubType) {
        let eventTypes = (await this.getAppState()).eventTypes

        eventTypes[eventTypes.findIndex(category => category.name === eventType)].subcategories.push(newEventSubType)
        return AppStateModel.updateOne({}, { eventTypes })
    },
    async deleteEventSubtype(eventType, newEventSubType) {
        let eventTypes = (await this.getAppState()).eventTypes

        eventTypes[eventTypes.findIndex(category => category.name === eventType)].subcategories = eventTypes[eventTypes.findIndex(category => category.name === eventType)].subcategories.filter(type => type !== newEventSubType)
        console.log(eventType, newEventSubType)
        console.log(eventTypes)
        return await AppStateModel.updateOne({}, { eventTypes })
    },
    deleteEventType(eventType) {
        return AppStateModel.findOneAndUpdate({}, { $pull: { eventTypes: { name: eventType } } })
    },
    getUsers() {
        return UserModel.find({}, {firstname: 1, lastname: 1, email: 1, phone: 1})
    }
}