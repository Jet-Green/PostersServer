const { Schema, model } = require('mongoose');

const AppStateModel = new Schema({
    eventTypes: [Object],
    featuredPosterId: { type: String, default: null }
})

module.exports = model('AppState', AppStateModel);