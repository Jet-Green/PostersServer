const Router = require('express').Router
const router = Router()
const apiController = require('../controllers/api-controller')
const apiMiddleware = require('../middleware/api-middleware')
const authMiddleware = require('../middleware/auth-middleware')

router.post('/get-all', apiMiddleware, apiController.getAll)

module.exports = router