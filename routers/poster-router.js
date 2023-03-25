//imports
const Router = require('express').Router

//controllers
const PosterController = require('../controllers/poster-controller')

const router = Router()

//routes
router.get('/create', PosterController.create)
router.post('/get-all', PosterController.getAll)
router.get('/find-by-id', PosterController.findById)
router.get('/delete-one', PosterController.deleteById)
router.get('/clear', PosterController.deleteMany)