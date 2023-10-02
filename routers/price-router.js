//imports
const Router = require('express').Router
const authMiddleware = require('../middleware/auth-middleware')

//controllers
const priceController = require('../controllers/price-controller.js')

const router = Router()

//routes
router.post('/create', authMiddleware, priceController.create)
router.get('/get-all', priceController.getAll)

module.exports = router