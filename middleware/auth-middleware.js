const ApiError = require("../exception/api-error")
const tokenService = require("../service/token-service")

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.cookies.accessToken;

        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader
        if (!accessToken) {
            return next(ApiError.UnauthorizedError())
        }

        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthorizedError())
        }

        req.user = userData;

        next();
    } catch (error) {
        return next(ApiError.UnauthorizedError())
    }
}