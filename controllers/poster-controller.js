const PosterService = require('../service/poster-service')

module.exports = {
    async sendModerationMessage(req, res, next) {
        try {
            return res.json(await PosterService.sendModerationMessage(req.body))
        } catch (error) {
            next(error)
        }
    },
    async moderatePoster(req, res, next) {
        try {
            return res.json(await PosterService.moderatePoster(req.query._id, req.query.value))
        } catch (error) {
            next(error)
        }
    },
    async getAll(req, res, next) {
        try {
            return res.json(await PosterService.findMany(req.body))
        } catch (error) {
            next(error)
        }
    },
    async getById(req, res, next) {
        try {
            const _id = req.query._id
            return res.json(await PosterService.getById(_id));
        } catch (error) {
            next(error)
        }
    },
    async getPostersOnModeration(req, res, next) {
        try {
            return res.json(await PosterService.getPostersOnModeration())
        } catch (error) {
            next(error)
        }
    },
    async create(req, res, next) {
        try {
            const posterId = await PosterService.createPoster(req.body)

            return res.json({ _id: posterId, message: 'Создано' })
        } catch (error) {
            next(error)
        }
    },
    async updatePoster(req, res, next) {
        try {
            const posterId = await PosterService.updatePoster(req.body)
            return res.json({ _id: posterId })
        } catch (error) {
            next(error)
        }
    },
    async uploadImage(req, res, next) {
        try {
            return res.json(await PosterService.updateImageUrl(req))
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
            const { _id, email } = req.query

            return await PosterService.deleteOne(_id, email);
        } catch (error) {
            next(error)
        }
    },
    async getUserPosters(req, res, next) {
        try {
            return res.json(await PosterService.getUserPosters(req.body))
        } catch (error) {
            next(error)
        }
    },
    async getPostersOnModeration(req, res, next) {
        try {
            return res.json(await PosterService.getPostersOnModeration())
        } catch (error) {
            next(error)
        }
    },
    async createDraft(req, res, next) {
        try {
            return res.json(await PosterService.createDraft(req.body))
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}