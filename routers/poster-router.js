//imports
const Router = require('express').Router

//controllers
const PosterController = require('../controllers/poster-controller')

const router = Router()

//routes
router.post('/create', PosterController.create)
router.post('/get-all', PosterController.getAll)
router.get('/find-by-id', PosterController.findById)
router.post('/delete-one', PosterController.deleteById)
router.get('/clear', PosterController.deleteMany)