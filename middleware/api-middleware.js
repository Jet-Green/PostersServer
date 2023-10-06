const ApiError = require("../exception/api-error");
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

        // const data = apiTokenModel.findOne({ token })
        if (token !== '123') {
            return next(ApiError.UnauthorizedError())
        }

        // req.org = data;

        next();
    } catch (error) {
        return next(ApiError.UnauthorizedError())
    }
}