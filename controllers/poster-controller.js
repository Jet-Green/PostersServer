const PosterService = require('../service/poster-service')
let EasyYandexS3 = require('easy-yandex-s3').default;

// Указываем аутентификацию в Yandex Object Storage
let s3 = new EasyYandexS3({
    auth: {
        accessKeyId: process.env.YC_KEY_ID,
        secretAccessKey: process.env.YC_SECRET,
    },
    Bucket: process.env.YC_BUCKET_NAME, // Название бакета
    debug: false, // Дебаг в консоли
});

module.exports = {
    async getAll(req, res, next) {
        try {
            return res.json(await PosterService.findMany())
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
    async create(req, res, next) {
        try {
            const posterId = await PosterService.createPoster(req.body)

            return res.json({ _id: posterId })
        } catch (error) {
            next(error)
        }
    },
    async uploadImage(req, res, next) {
        try {
            let buffer = {
                buffer: req.files[0].buffer, name: req.files[0].originalname,
            }
            let posterId = req.query.poster_id

            let uploadResult = await s3.Upload(buffer, '/plakat-city/');
            let filename = uploadResult.Location

            if (filename) {
                await PosterService.updateImageUrl(posterId, filename)
            }
            return res.json(filename)
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
}