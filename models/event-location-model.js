const { Schema, model } = require('mongoose');

const EventLocationModel = new Schema({
    name: String,
    geo_lat: String,
    geo_lon: String
})

module.exports = model('EventLocation', EventLocationModel);