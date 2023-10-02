const Router = require('express').Router
const authMiddleware = require('../middleware/auth-middleware')
const eventLogController = require('../controllers/event-log-controller')

const router = Router()

router.get('/get-logs-by-userId',authMiddleware, eventLogController.getLogsByUserId)
router.get('/get-logs-lenght',authMiddleware, eventLogController.getLogsLenght)


module.exports = router

