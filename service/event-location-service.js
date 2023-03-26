const EventLocationModel = require('../models/event-location-model.js');

module.exports = {
    getAll() {
        return EventLocationModel.find({})
    }
}