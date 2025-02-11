const { Schema, model } = require('mongoose');

const PosterSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String },
    description: { type: String },
    image: { type: String },
    site: { type: String },
    organizer: { type: String },
    phone: { type: String },
    email: { type: String },

    eventLocation: { type: Object },

    eventIsOn: { type: String },
    date: { type: Array  },
    workingTime: { type: String },

    eventType: { type: [String] },
    eventSubtype: { type: [String] },

    endEventDate: String,

    ageLimit: { type: String },
    price: { type: String },

    isHidden: { type: Boolean, default: false },

    isModerated: { type: Boolean, default: false },
    moderationMessage: String,
    rejected: { type: Boolean, default: false },

    publicationDate: Number,
    endDate: Number,

    createdDate: Number,
    posterType: String, // 'place' or 'event'

    isDraft: { type: Boolean, default: false }
})

module.exports = model('Poster', PosterSchema);