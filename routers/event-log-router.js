const Router = require('express').Router

const eventLogController = require('../controllers/event-log-controller')

const router = Router()

router.get('/get-logs-by-userId', eventLogController.getLogsByUserId)
router.get('/get-logs-lenght', eventLogController.getLogsLenght)


module.exports = router

