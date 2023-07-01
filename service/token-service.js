const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const tokenModel = require('../models/token-model');


module.exports = {
    validateResetToken(token, secret) {
        try {
            let payload = jwt.verify(token, secret);
            return payload
        } catch (error) {
            return null
        }
    },

    createResetToken(payload, secret) {
        try {
            let result = jwt.sign(payload, secret, { expiresIn: '15m' })
            return result
        } catch (error) {
            return null
        }
    },

    generateTokens(payload) {
        try {
            const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '60m' });
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

            return { accessToken, refreshToken };
        } catch (error) {
            return { accessToken: null, refreshToken: null }
        }
    },

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData;
        } catch (error) {
            return null;
        }
    },

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData;
        } catch (error) {
            return null;
        }
    },

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({ user: new mongoose.Types.ObjectId(userId) })
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return await tokenModel.save()
        }

        const token = await tokenModel.create({ userId, refreshToken });

        return token;
    },

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({ refreshToken })

        return tokenData;
    },

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({ refreshToken })

        return tokenData;
    },
}
