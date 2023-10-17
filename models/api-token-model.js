const { Schema, model } = require('mongoose');

const ApiTokenSchema = new Schema({
    organization: { type: Schema.Types.ObjectId, ref: 'Ord' },
    site: { type: String },
    token: { type: String }
})

module.exports = model('ApiToken', ApiTokenSchema);
