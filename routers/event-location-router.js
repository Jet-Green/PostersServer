//imports
const Router = require('express').Router

//controllers
const EventLocationController = require('../controllers/event-location-controller.js')

const router = Router()

//routes
router.get('/get-all', EventLocationController.getAll)

module.exports = router