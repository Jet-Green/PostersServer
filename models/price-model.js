const { Schema, model } = require('mongoose');

const PriceSchema = new Schema({
    name: { type: String },
    price: { type: Number },
    profit: { type: Number },
    numberPosters: { type: Number },
})

module.exports = model('Price', PriceSchema);
