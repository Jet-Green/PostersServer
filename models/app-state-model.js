const { Schema, model } = require('mongoose');

const AppStateModel = new Schema({
    eventTypes: [Object]
})

module.exports = model('AppState', AppStateModel);