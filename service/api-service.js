const AppStateModel = require('../models/app-state-model');

module.exports = {
    async getEventTypes() {
        let eventTypes = await AppStateModel.find({},{ eventTypes: 1 })
    
        return eventTypes[0]
    }

}