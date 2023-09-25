const EventLogService = require('../service/event-log-service')

module.exports = {

  async getLogsByUserId(req, res, next) {
    return res.json(await EventLogService.getLogsByUserId(req.query._id, req.query.page))
  },
  async getLogsLenght(req, res, next) {
    return res.json(await EventLogService.getLogsLenght(req.query._id))
  }
  
}