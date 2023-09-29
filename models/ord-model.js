const { Schema, model } = require('mongoose');

const OrdSchema = new Schema({
    organization: { type: Object },

})

module.exports = model('Ord', OrdSchema);
