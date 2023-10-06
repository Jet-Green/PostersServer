//imports
const Router = require('express').Router
const ordController = require('../controllers/ord-controller.js')
const authMiddleware = require('../middleware/auth-middleware')

const router = Router()

//routes
router.get('/get-organisation', ordController.getOrganisation )
router.post('/create-organisation', authMiddleware, ordController.createOrganisation)
router.post('/create-contract', authMiddleware, ordController.createContract)

module.exports = router