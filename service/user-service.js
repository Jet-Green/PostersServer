const UserModel = require('../models/user-model')
const RoleModel = require('../models/role-model')
const bcrypt = require('bcryptjs');
const TokenService = require('../service/token-service')
const { sendMail } = require('../middleware/mailer');

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

            return {
                ...tokens,
                user
            }
        }
        return null
    },
    async validateEnterToResetPassword(payload) {
        let { user_id, token } = payload;

        let candidate = await UserModel.findById(user_id)
        if (!candidate) return new Error('Пользователь с таким _id не найден')

        let secret = process.env.JWT_RESET_SECRET + candidate.password
        let result = TokenService.validateResetToken(token, secret)

        if (result == null) return new Error('Нет доступа')

        return result
    },
    async sendResetLink(email) {
        let candidate = await UserModel.findOne({ email: email })

        if (!candidate)
            return new Error('Пользователь с таким email не найден')

        // ну вот так
        const secret = process.env.JWT_RESET_SECRET + candidate.password
        const payload = {
            email: candidate.email,
            _id: candidate._id
        }

        const token = TokenService.createResetToken(payload, secret)

        const link = process.env.CLIENT_URL + `/forgot-password?user_id=${candidate._id}&token=${token}`

        sendMail({ link: link }, 'reset-password.hbs', [candidate.email], 'single')

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
            let adminUser = new RoleModel({ value: 'super_admin' })
            await defaultUser.save()
            await adminUser.save()
        } catch (err) { }

        const candidate = await UserModel.findOne({ email })
        if (candidate) {
            return new Error(`Пользователь с почтой ${email} уже существует`)
        }

        const hashPassword = await bcrypt.hash(password, 3)
        const adminUserRole = await RoleModel.findOne({ value: 'super_admin' })
        const user = await UserModel.create({ email, password: hashPassword, firstname, lastname, phone, roles: [adminUserRole.value], })

        const tokens = TokenService.generateTokens({ email, hashPassword, _id: user._id })
        await TokenService.saveToken(user._id, tokens.refreshToken);

        return {
            ...tokens,
            user
        }
    },
    async login(email, password) {
        const user = await UserModel.findOne({ email })

        if (!user) {
            return new Error('Пользователь с таким email не найден')
        }

        const isPassEquals = await bcrypt.compare(password, user.password)

        if (!isPassEquals) {
            return new Error('Неверный пароль')
        }

        const tokens = TokenService.generateTokens({ email, password: user.password, _id: user._id })

        await TokenService.saveToken(user._id, tokens.refreshToken);
        return {
            ...tokens,
            // pass the data to client
            user
        }
    },
    async refresh(refreshToken) {
        if (!refreshToken) {
            return new Error('Unauthorized');
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            return new Error('Unauthorized');
        }

        const user = await UserModel.findById(userData._id)

        const tokens = TokenService.generateTokens({ email: user.email, password: user.password, _id: user._id })
        await TokenService.saveToken(user._id, tokens.refreshToken);
        return {
            ...tokens,
            // pass the data to client
            user
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
    }
}