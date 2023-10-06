//imports
const Router = require('express').Router
const authMiddleware = require('../middleware/auth-middleware')

//controllers
const PosterController = require('../controllers/poster-controller')

const multer = require('multer')

const router = Router()

//routes
router.post('/create',authMiddleware, PosterController.create)
router.post('/create-draft',authMiddleware, PosterController.createDraft)

router.get('/get-posters',authMiddleware, PosterController.getPosters)
router.post('/get-all', PosterController.getAll)
router.post('/find', PosterController.find)
router.post('/upload-image',authMiddleware, multer().any(), PosterController.uploadImage)
router.get('/delete-by-id',authMiddleware, PosterController.deleteById)
router.get('/hide-by-id',authMiddleware, PosterController.hideById)
router.post('/prolong-by-id',authMiddleware, PosterController.prolongById)
router.get('/get-posters-on-moderation', authMiddleware, PosterController.getPostersOnModeration)
router.get('/get-by-id', PosterController.getById)
router.post('/get-user-posters',authMiddleware, PosterController.getUserPosters)
router.post('/update',authMiddleware, PosterController.updatePoster)
router.get('/clear',authMiddleware, PosterController.deleteMany)

router.post('/edit',authMiddleware, PosterController.editPoster)

router.get('/moderate',authMiddleware, PosterController.moderatePoster)
router.post('/reject-poster',authMiddleware, PosterController.rejectPoster)

module.exports = router