const { Schema, model } = require('mongoose');

const OrdSchema = new Schema({
    organization: {
        id: String,
        inn: String,
        isOrs: Boolean,
        isRr: Boolean,
        mobilePhone: String,
        name: String,
        platforms: Array
    },
})

module.exports = model('Ord', OrdSchema);
