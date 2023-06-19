const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: { type: String },
    password: { type: String },
    firstname: { type: String },
    lastname: { type: String },
    phone: { type: String },
    roles: { type: Array },
    posters: [{ type: Schema.Types.ObjectId, ref: 'Poster' }],
    subscription: { type: Object, default: {} },
})

module.exports = model('User', UserSchema);
