const { Schema, model } = require('mongoose');

const RoleSchema = new Schema({
    value: { type: String, default: "user", unique: true },
})

module.exports = model('Role', RoleSchema);