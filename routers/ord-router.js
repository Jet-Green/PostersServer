//imports
const Router = require('express').Router
const ordController = require('../controllers/ord-controller.js')


const router = Router()

//routes
router.get('/get-organisation',ordController.getOrganisation )
router.post('/create-organisation', ordController.createOrganisation)
router.post('/create-contract', ordController.createContract)

module.exports = router