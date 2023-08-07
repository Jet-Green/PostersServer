const { Schema, model } = require('mongoose');

const PosterDraftSchema = new Schema({
    title: { type: String },
    description: { type: String },
    image: { type: String },
    eventLocation: { type: Object },
    site: { type: String },
    organizer: { type: String },
    phone: { type: String },
    email: { type: String },
    date: { type: Number },
    workingTime: { type: String },
    eventType: { type: String },
})

module.exports = model('PosterDraft', PosterDraftSchema);