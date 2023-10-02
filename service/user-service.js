const UserModel = require('../models/user-model')
const RoleModel = require('../models/role-model')
const bcrypt = require('bcryptjs');
const TokenService = require('../service/token-service')
const EventLogService = require('../service/event-log-service')
const { sendMail } = require('../middleware/mailer');

const UserDto = require('../dtos/user-dto');
const ApiError = require('../exception/api-error');

module.exports = {
    async resetPassword(payload) {
        let { password, token, user_id } = payload;
        let result;
        try {
            result = await this.validateEnterToResetPassword({ token, user_id })
        } catch (error) { }

        if (result) {
            const hashPassword = await bcrypt.hash(password, 3)
            const user = await UserModel.findOneAndUpdate({ _id: user_id }, { password: hashPassword })

            const tokens = TokenService.generateTokens({ email: user.email, hashPassword, _id: user._id })
            await TokenService.saveToken(user._id, tokens.refreshToken);

            let userToSend = new UserDto(user)

            return {
                ...tokens,
                user: userToSend
            }
        }
        return null
    },
    async validateEnterToResetPassword(payload) {
        let { user_id, token } = payload;

        let candidate = await UserModel.findById(user_id)
        if (!candidate) throw ApiError.BadRequest('Пользователь с таким _id не найден')

        let secret = process.env.JWT_RESET_SECRET + candidate.password
        let result = TokenService.validateResetToken(token, secret)

        if (result == null) throw ApiError.AccessDenied()

        return result
    },
    async sendResetLink(email) {
        let candidate = await UserModel.findOne({ email: email })

        if (!candidate)
            throw ApiError.BadRequest('Пользователь с таким email не найден')

        // ну вот так
        const secret = process.env.JWT_RESET_SECRET + candidate.password
        const payload = {
            email: candidate.email,
            _id: candidate._id
        }

        const token = TokenService.createResetToken(payload, secret)

        const link = process.env.CLIENT_URL + `/forgot-password?user_id=${candidate._id}&token=${token}`

        // порпишу html тут, чтобы не отправлять токен на клиент
        sendMail(
            `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>PlPo - место для ваших афиш</title>
                </head>
                <body>
                    <h3> PlPo восстановление пароля </h3> 
                    <h4> Перейдите по ссылке: </h4> 
                    <p><a href="${link}">${link}</a></p>
                </body>
            </html>`,
            [candidate.email], 'Восстанoвление пароля')
        return link
    },
    async clearUsers() {
        console.log(
            await UserModel.deleteMany({})
        );
    },
    async registration(email, password, firstname, lastname, phone) {
        try {
            let defaultUser = new RoleModel()
            let adminUser = new RoleModel({ value: 'admin' })
            await defaultUser.save()
            await adminUser.save()
        } catch (err) { }

        const candidate = await UserModel.findOne({ email })
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтой ${email} уже существует`)
        }

        const hashPassword = await bcrypt.hash(password, 3)
        // const adminUserRole = await RoleModel.findOne({ value: 'admin' })
        const defaultUserRole = await RoleModel.findOne({ value: 'user' })
        const user = await UserModel.create({ email, password: hashPassword, firstname, lastname, phone, roles: [defaultUserRole], })

        const tokens = TokenService.generateTokens({ email, hashPassword, _id: user._id })
        await TokenService.saveToken(user._id, tokens.refreshToken);

        let userToSend = new UserDto(user)

        return {
            ...tokens,
            user: userToSend
        }
    },
    async login(email, password) {
        const user = await UserModel.findOne({ email })

        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }

        const isPassEquals = await bcrypt.compare(password, user.password)

        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }

        const tokens = TokenService.generateTokens({ email, password: user.password, _id: user._id })

        await TokenService.saveToken(user._id, tokens.refreshToken);

        let userToSend = new UserDto(user)

        return {
            ...tokens,
            user: userToSend
        }
    },
    async refresh(refreshToken) {
        if (!refreshToken)
            throw ApiError.UnauthorizedError();

        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }

        const user = await UserModel.findById(userData._id)

        await TokenService.removeToken(refreshToken)
        const tokens = TokenService.generateTokens({ email: user.email, password: user.password, _id: user._id })
        await TokenService.saveToken(user._id, tokens.refreshToken);

        let userToSend = new UserDto(user)

        return {
            ...tokens,
            user: userToSend
        }
    },
    async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken);

        return token;
    },
    async update(user) {
        let email = user.email;
        delete user.email
        return await UserModel.findOneAndUpdate({ email }, user, {
            new: true
        })
    },
    buyPosters(buyEvent) {
        EventLogService.buyPostersLog(buyEvent)
        return UserModel.findByIdAndUpdate({ _id: buyEvent._id }, { $inc: { 'subscription.count': buyEvent.numberPosters } })
    },
    subscriptionCount({ _id }) {
        return UserModel.findOne({ _id: _id }, { 'subscription.count': 1 })
    }
}
