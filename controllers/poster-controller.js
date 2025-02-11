const { sendMail } = require('../middleware/mailer')
const PosterService = require('../service/poster-service')
const vkapi = require('../middleware/vk-api')
const userModel = require('../models/user-model')

module.exports = {
    async rejectPoster(req, res, next) {
        try {
            return res.json(await PosterService.rejectPoster(req.body))
        } catch (error) {
            next(error)
        }
    },
    async moderatePoster(req, res, next) {
        try {
            if (process.env.NODE_ENV === 'production') {
                let poster = await PosterService.getById(req.query._id);
                // console.log('poster',poster)
                if (poster.eventLocation.name.includes("Удмуртская Респ, г Глазов")) {
                    try {
                        await vkapi.postInGroup(`${process.env.CLIENT_URL}/post?_id=${req.query._id}`, poster, 'Glazov');
                    } catch (vkError) {
                        console.error("Error posting in VK group:", vkError);
                        // Handle the error or log it, but don't stop execution
                    }
                }

                if (poster.eventLocation.name.includes("г Ижевск")) {
                    try {
                        await vkapi.postInGroup(`${process.env.CLIENT_URL}/post?_id=${req.query._id}`, poster, 'Izhevsk');
                    } catch (vkError) {
                        console.error("Error posting in VK group:", vkError);
                        // Handle the error or log it, but don't stop execution
                    }
                }
            }

            // Regardless of the vkapi result, proceed to moderate the poster
            return res.json(await PosterService.moderatePoster(req.query._id, req.query.userId));
        } catch (error) {
            next(error);
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
            return res.json(await PosterService.getPostersOnModeration(req.query.status))
        } catch (error) {
            next(error)
        }
    },
    async getManagerPostersOnModeration(req, res, next) {
        try {
            let cities=req.query.cities.split(',')
            let areas=req.query.areas.split(',')
            let regions=req.query.regions.split(',')
            return res.json(await PosterService.getManagerPostersOnModeration(req.query.status,cities,areas,regions))
        } catch (error) {
            next(error)
        }
    },
    async create(req, res, next) {
        try {
            const posterId = await PosterService.createPoster(req.body)
            if (process.env.NODE_ENV == 'production') {//process.env.NODE_ENV == 'production'
                let usersToMail = await userModel.find({
                    $or: [
                        { "managerIn":{$elemMatch: { "type": "city_with_type", "name": req.body.poster.eventLocation.city_with_type } }},
                        { "managerIn":{$elemMatch: { "type": "area_with_type", "name": req.body.poster.eventLocation.area_with_type } }},
                        { "managerIn":{$elemMatch: { "type": "region_with_type", "name": req.body.poster.eventLocation.region_with_type } }},
                    ]
                }
                );
                usersToMail=usersToMail.map((item)=>item.email)
                // mailing
                await sendMail(`
                    <!DOCTYPE html>
                    <html lang="ru">
                    <head>
                    </head>
                    <body>
                    ${JSON.stringify(req.body)}
                    </body>
                    </html>`, emails = [...usersToMail, 'grachevrv@ya.ru', 'grishadzyin@gmail.com'], 'Создана афиша')
            }
            // 'grachevrv@ya.ru', 'grishadzyin@gmail.com'

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

            return res.json(await PosterService.deleteOne(_id, email));
        } catch (error) {
            next(error)
        }
    },
    async hideById(req, res, next) {
        try {
            return res.json(await PosterService.findByIdAndHide(req.query._id, req.query.isHidden));
        } catch (error) {
            next(error)
        }
    },
    async prolongById(req, res, next) {
        try {
            return res.json(await PosterService.findByIdAndProlong(req.body));
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
    async createDraft(req, res, next) {
        try {
            return res.json(await PosterService.createDraft(req.body))
        } catch (error) {
            next(error)
        }
    },
    async getPosters(req, res, next) {
        try {
            return res.json(await PosterService.getPosters(req.query))
        } catch (error) {
            next(error)
        }
    },
    async getPostersMiniature(req, res, next) {
        try {
            return res.json(await PosterService.getPostersMiniature(req.query))
        } catch (error) {
            next(error)
        }
    },
    async editPoster(req, res, next) {
        try {
            return res.json(await PosterService.editPoster(req.body, req.query._id))
        } catch (error) {
            next(error)
        }
    },
    async find(req, res, next) {
        try {
            return res.json(await PosterService.find(req.body))
        } catch (error) {
            next(error)
        }
    },
    async getIds(req, res, next) {
        try {
            return res.json(await PosterService.getIds())
        } catch (error) {
            next(error)
        }
    },
    async getActiveCategories(req, res, next) {
        try {
            return res.json(await PosterService.getActiveCategories(req.body.location, req.body.radius, req.body.coordinates))
        } catch (error) {
            next(error)
        }
    },
    async getActiveCities(req, res, next) {
        try {
            return res.json(await PosterService.getActiveCities())
        } catch (error) {
            next(error)
        }
    },
}