const Router = require('express').Router
const router = Router()
const authMiddleware = require('../middleware/auth-middleware')

const appStateController = require('../controllers/app-state-controller.js')

router.get('/get-state', appStateController.getState)
router.post('/add-event-type', authMiddleware, appStateController.addEventType)
router.post('/add-event-subtype', authMiddleware, appStateController.addEventSubtype)
router.post('/delete-event-subtype', authMiddleware, appStateController.deleteEventSubtype)
router.post('/delete-event-type', authMiddleware, appStateController.deleteEventType)

router.get('/get-users', authMiddleware, appStateController.getUsers)

router.post('/user-to-manager', authMiddleware, appStateController.userToManager)

module.exports = router