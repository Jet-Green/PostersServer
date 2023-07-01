const { Schema, model } = require('mongoose');

const AppStateModel = new Schema({
    eventTypes: Array
})

module.exports = model('AppState', AppStateModel);