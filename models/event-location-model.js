const { Schema, model } = require('mongoose');

const EventLocationModel = new Schema({
    name: String,
    geo_lat: String,
    geo_lon: String,
    // city: String,
    // settlement: String,
    // region: String,
    // area: String,
})

module.exports = model('EventLocation', EventLocationModel);