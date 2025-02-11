const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: { type: String },
    password: { type: String },
    firstname: { type: String },
    lastname: { type: String },
    phone: { type: String, unique: true },
    roles: { type: [String] },
    posters: [{ type: Schema.Types.ObjectId, ref: 'Poster' }],
    subscription: { count: { type: Number, default: 0 } },
    contracts: { type: [Object] },
    managerIn: {type: [Object], required:false, default: undefined},
})

module.exports = model('User', UserSchema);
