//imports
const Router = require('express').Router
const ordController = require('../controllers/ord-controller.js')
const authMiddleware = require('../middleware/auth-middleware')

const router = Router()

//routes
router.get('/get-organisation', ordController.getOrganization)
router.post('/create-organization', authMiddleware, ordController.createOrganization)
router.post('/create-contract', authMiddleware, ordController.createContract)

module.exports = router