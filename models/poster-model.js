const { Schema, model } = require('mongoose');

const PosterSchema = new Schema({
    image: { type: String },
    title: { type: String },
    eventLocation: { type: Object },
    site: { type: String },
    organizer: { type: String },
    phone: { type: String },
    email: { type: String },
    date: { type: Number },
    workingTime: { type: String },
    eventType: { type: String },
})

module.exports = model('Poster', PosterSchema);