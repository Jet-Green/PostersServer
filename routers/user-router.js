const Router = require('express').Router
const userController = require('../controllers/user-controller')


const router = Router()


router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/refresh', userController.refresh)
router.post('/logout', userController.logout)
// router.post('/update', userController.update)

router.post('/forgot-password', userController.sendResetLink)
router.post('/reset-password', userController.resetPassword)

// router.get('/clear-users', userController.clearUsers)

router.post('/buy-posters', userController.buyPosters)
router.post('/subscription-count', userController.subscriptionCount)

module.exports = router