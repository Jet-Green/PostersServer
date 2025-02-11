const UserService = require('../service/user-service')
const logger = require('../logger');

module.exports = {
    async getByEmail(req, res, next) {
        try {
            x = res.json(await UserService.getByEmail(req.query.email))
            // console.log(x)
            return x
        } catch (error) {
            next(error)
        }
    },
    async resetPassword(req, res, next) {
        try {
            const userData = await UserService.resetPassword(req.body)

            // добавить флаг secure: true чтобы активировать https
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.cookie('accessToken', userData.accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true });
            return res.json(userData)
        } catch (error) {
            next(error)
        }
    },
    async sendResetLink(req, res, next) {
        try {
            let link = await UserService.sendResetLink(req.body.email)
            return res.json(link)
        } catch (error) {
            next(error)
        }
    },
    async buyTrip(req, res, next) {
        try {
            const _id = req.body._id
            const userEmail = req.body.userEmail
            return res.json(await UserService.buyTrip(_id, userEmail))
        } catch (error) {
            next(error)
        }
    },
    async clearUsers() {
        try {
            UserService.clearUsers()
        } catch (error) {

        }
    },
    async registration(req, res, next) {
        try {
            const { email, password, firstname, lastname, phone } = req.body;

            const userData = await UserService.registration(email, password, firstname, lastname, phone)
            // remove access and refresh tokens
            logger.info({ email: userData.user.email }, 'user has registered')

            // добавить флаг secure: true чтобы активировать https
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.cookie('accessToken', userData.accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true });
            return res.json(userData)
        } catch (error) {
            next(error)
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await UserService.login(email, password)

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.cookie('accessToken', userData.accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true });
            return res.json(userData)
        } catch (error) {
            next(error)
        }
    },
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;

            const userData = await UserService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            res.cookie('accessToken', userData.accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true });
            // const newUser = await UserService.update(userData)

            return res.json(userData);
        } catch (error) {
            // попадаем в middleware с обработкой ошибок
            next(error)
        }
    },
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await UserService.logout(refreshToken)
            res.clearCookie('refreshToken')
            res.clearCookie('accessToken')

            return res.json(token);
        } catch (error) {
            // попадаем в middleware с обработкой ошибок
            next(error)
        }
    },
    async update(req, res, next) {
        try {
            const newUser = await UserService.update(req.body)
            return res.json(newUser)
        } catch (error) {
            next(error)
        }
    },
    async buyPosters(req, res, next) {
        try {
            return res.json(await UserService.buyPosters(req.body))
        } catch (error) {
            next(error)
        }
    },
    async subscriptionCount(req, res, next) {
        try {
            return res.json(await UserService.subscriptionCount(req.body))
        } catch (error) {
            next(error)
        }
    },
    
    async incrementPaidPosters(req, res, next) {
        try {
        
            return res.json(await UserService.incrementPaidPosters(req.body))
        } catch (error) {
            next(error)
        }
    },
    
    async removeLocationToEmail(req, res, next) {
        try {
            return res.json(await UserService.removeLocationToEmail(req.body.managerIn, req.body.email))
        } catch (error) {
            next(error)
        }
    },
    async addLocationToEmail(req, res, next) {
        try {
            return res.json(await UserService.addLocationToEmail(req.body.email, req.body.select, req.body.location))
        } catch (error) {
            next(error)
        }
    },
    async removeManager(req, res, next) {
        try {
            return res.json(await UserService.removeManager(req.body.email))
        } catch (error) {
            next(error)
        }
    },
    async removeManagerInLocations(req, res, next) {
        try {
            return res.json(await UserService.removeManagerInLocations(req.body.email))
        } catch (error) {
            next(error)
        }
    },
    async getManagers(req, res, next) {
        try {
            return res.json(await UserService.getManagers())
        } catch (error) {
            next(error)
        }
    },
}