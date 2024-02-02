class ApiError extends Error {
	status
	errors

	constructor(status, message, errors = []) {
		super(message);
		this.status = status;
		this.errors = errors;
	}

	static UnauthorizedError() {
		return new ApiError(401)
	}

	static AccessDenied() {
		return new ApiError(403, 'Отказано в доступе')
	}

	static BadRequest(message, errors = []) {
		return new ApiError(400, message, errors)
	}
}

module.exports = ApiError