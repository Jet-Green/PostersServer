const AppStateModel = require('../models/app-state-model');

module.exports = {
    async getAppState() {
        let allStates = await AppStateModel.find({})
        if (allStates.length == 0) {
            return await AppStateModel.create({})
        }
        return allStates[0]
    },
    addEventType(newEventType) {
        return AppStateModel.findOneAndUpdate({}, { $push: { eventTypes: newEventType } })
    },
    deleteEventType(eventType) {
        return AppStateModel.findOneAndUpdate({}, { $pull: { eventTypes: eventType } })
    }
}