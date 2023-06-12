const AppStateModel = require('../models/app-state-model');

module.exports = {
    async getAppState() {
        let allStates = await AppStateModel.find({})
        if (allStates.length == 0) {
            return await AppStateModel.create({})
        }
        return allStates[0]
    }
}