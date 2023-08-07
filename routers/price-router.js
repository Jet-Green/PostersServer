//imports
const Router = require('express').Router

//controllers
const priceController = require('../controllers/price-controller.js')

const router = Router()

//routes
router.post('/create', priceController.create)
router.get('/get-all', priceController.getAll)

module.exports = router