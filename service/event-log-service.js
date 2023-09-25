const EventLog = require('../models/event-log')


module.exports = {
  async getLogsByUserId(_id, page) {

    const limit = 10;
    const sitePage = page;
    const skip = (sitePage - 1) * limit;
    return await EventLog.find({ userId: _id }).sort({ date: -1 }).skip(skip).limit(limit)
  },

  async getLogsLenght(_id) {
    return (await EventLog.find({ userId: _id })).length
  },
  buyPostersLog(buyEvent) {
    let eventObj = {}
    eventObj.userId = buyEvent._id
    eventObj.date = Date.now()
    eventObj.type = "оплата"
    eventObj.name = buyEvent.name
    eventObj.amount = buyEvent.numberPosters
    eventObj.price = (buyEvent.price / buyEvent.numberPosters).toFixed(0)
    eventObj.total = buyEvent.price
    return EventLog.create(eventObj)
  },
  setPostersLog(setEvent) {
    let eventObj = {}
    eventObj.userId = setEvent._id
    eventObj.date = Date.now()
    eventObj.name = setEvent.name
    eventObj.amount = 1
    eventObj.type = "публикация"
    return EventLog.create(eventObj)
  },
  prolongPostersLog(setEvent) {
    let eventObj = {}
    eventObj.userId = setEvent._id
    eventObj.date = Date.now()
    eventObj.name = setEvent.name
    eventObj.amount = 1
    eventObj.type = "продление"
    return EventLog.create(eventObj)
  }
}