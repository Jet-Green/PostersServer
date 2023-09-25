const { Schema, model } = require('mongoose')

const EventLogSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: 'User'},
  date: Number,
  type: String,
  name: String,
  amount: Number,
  price: Number,
  total: Number,
})

module.exports = model('EventLog', EventLogSchema);