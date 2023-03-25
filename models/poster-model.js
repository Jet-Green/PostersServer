const { Schema, model } = require('mongoose');

const PosterSchema = new Schema({
    image: { type: String},
    title: { type: String},
    eventLocation: { type: String},
    site: { type: String},
    organizer: { type: String},
    phone: { type: String },
    email: { type: String },
    time: { type: Number },
    date: {type: Number},
    workingTime: { type:String },
    eventType: {type:String},
})

module.exports = model('Poster', PosterSchema);