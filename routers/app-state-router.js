const Router = require('express').Router
const router = Router()

const appStateController = require('../controllers/app-state-controller.js')

router.get('/get-state', appStateController.getState)
router.post('/add-event-type', appStateController.addEventType)
router.post('/add-event-subtype', appStateController.addEventSubtype)
router.post('/delete-event-type', appStateController.deleteEventType)

module.exports = router