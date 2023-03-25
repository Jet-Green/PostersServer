//imports
const Router = require('express').Router

//controllers
const PosterController = require('../controllers/poster-controller')

const multer = require('multer')

const router = Router()

//routes
router.post('/create', PosterController.create)
router.post('/get-all', PosterController.getAll)
router.post('/upload-image', multer().any(), PosterController.uploadImage)

router.get('/get-by-id', PosterController.getById)
router.post('/delete-one', PosterController.deleteById)
router.get('/clear', PosterController.deleteMany)

module.exports = router