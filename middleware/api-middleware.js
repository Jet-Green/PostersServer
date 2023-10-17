const ApiError = require("../exception/api-error");
const apiTokenModel = require("../models/api-token-model");
const tokenService = require("../service/token-service")

module.exports = async function(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }

        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            return next(ApiError.UnauthorizedError())
        }

        const data = await apiTokenModel.findOne({ token })
        if (!data) {
            return next(ApiError.UnauthorizedError())
        }

        req.org = data;

        next();
    } catch (error) {
        return next(ApiError.UnauthorizedError())
    }
}