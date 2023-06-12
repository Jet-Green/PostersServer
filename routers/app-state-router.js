const Router = require('express').Router
const router = Router()

const appStateController = require('../controllers/app-state-controller.js')

router.get('/get-state', appStateController.getState)

module.exports = router