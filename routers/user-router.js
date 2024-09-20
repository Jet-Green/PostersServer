const Router = require('express').Router
const userController = require('../controllers/user-controller')
const authMiddleware = require('../middleware/auth-middleware')

const router = Router()

router.get('/get-by-email', userController.getByEmail)

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/refresh', userController.refresh)
router.post('/logout', userController.logout)
// router.post('/update', userController.update)

router.post('/forgot-password', userController.sendResetLink)
router.post('/reset-password', userController.resetPassword)

// router.get('/clear-users', userController.clearUsers)

router.post('/buy-posters', authMiddleware, userController.buyPosters)
router.post('/subscription-count', authMiddleware, userController.subscriptionCount)

router.post('/remove-location-to-email', userController.removeLocationToEmail)
router.post('/add-location-to-email', userController.addLocationToEmail)
router.post('/remove-manager-in', userController.removeManagerIn)

module.exports = router