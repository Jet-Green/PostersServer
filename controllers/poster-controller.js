const PosterService = require('../service/poster-service')

module.exports = {

    async getAll(req, res, next) {
        try {
            return res.json(await PosterService.findMany())
        } catch (error) {
            next(error)
        }
    },
    async findById(req, res, next) {
        try {
            const _id = req.query._id
            return res.json(await PosterService.findById(_id));
        } catch (error) {
            next(error)
        }
    },
    async create(req, res, next) {
        try {
            const posterId = await PosterService.createPoster(req.body)

            return res.json({ _id: posterId })
        } catch (error) {
            next(error)
        }
    },

    async deleteMany(req, res, next) {
        try {
            PosterService.deleteMany()
        } catch (error) {
            next(error)
        }
    },
    async deleteById(req, res, next) {
        try {
            const _id = req.body._id
            return await PosterService.deleteOne(_id);
        } catch (error) {
            next(error)
        }
    },
}