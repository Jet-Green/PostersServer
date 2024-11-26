const PosterModel = require('../models/poster-model.js')
const UserModel = require('../models/user-model.js')
const EventLocationModel = require('../models/event-location-model.js');
const EventLogService = require('../service/event-log-service')
const UserService = require('../service/user-service');
// const telegramService = require('./telegram-service.js');
const vkapi = require('../middleware/vk-api.js')
const _ = require('lodash')


const logger = require('../logger.js')

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
    async rejectPoster({
        _id,
        message
    }) {
        logger.info({
            _id
        }, 'poster rejected')
        return PosterModel.findByIdAndUpdate(_id, {
            moderationMessage: message,
            rejected: true
        })
    },
    async moderatePoster(_id, userId) {
        let res = await UserService.subscriptionCount({
            _id: userId
        })
        if (res.subscription.count) {
            await UserModel.findByIdAndUpdate(userId, {
                $inc: {
                    'subscription.count': -1
                }
            })
            // for log
            let setEvent = {}
            setEvent._id = userId
            await PosterModel.find({
                _id: _id
            }).then((data) => {
                setEvent.name = data[0].title
            })
            await EventLogService.setPostersLog(setEvent)

            logger.info({
                _id,
                userId
            }, 'poster moderated and published')

            // вызывает конфиликт с ботом в продакшене
            let poster = await PosterModel.findById(_id)

            if (poster.eventLocation.name.includes("Удмуртская Респ, г Глазов")) {

                // telegramService.sendPost(poster)

            }


            // 2592000000 - 30 дней
            return PosterModel.findByIdAndUpdate(_id, {
                isModerated: true,
                rejected: false,
                publicationDate: Date.now(),
                endDate: Date.now() + 2592000000
            }, {
                new: true
            })
        } else {
            return false
        }

    },
    async createDraft({
        poster,
        userId
    }) {
        let {
            eventLocation
        } = poster
        if (eventLocation) {

            let city = eventLocation.city_with_type
            let settlement = eventLocation.settlement_with_type
            let region = eventLocation.region_with_type
            let area = eventLocation.area_with_type
            let capital_marker = eventLocation.capital_marker
            let location = ''
            //! не удалять пробелы в строках
            if (region && capital_marker != 2 && region != city) {
                location = `${region}, `
            }
            if (city) {
                location = `${location}${city}`
            }
            if (area) {
                location = `${location}${area}`
            }
            if (settlement) {
                location = `${location}, ${settlement}`
            }
            //! не удалять пробелы в строках

            let candidateEventLocationInDB = await EventLocationModel.findOne({
                name: location
            })
            if (!candidateEventLocationInDB && location) {
                await EventLocationModel.create({
                    name: location
                })
            }

            poster.eventLocation.name = eventLocation.name
        }

        poster.isDraft = true
        poster.isModerated = false
        poster.rejected = false
        const posterFromDb = await PosterModel.create(poster)

        await UserModel.findByIdAndUpdate(userId, {
            $push: {
                posters: posterFromDb._id
            }
        })
        return posterFromDb._id.toString()
    },
    async createPoster({
        poster,
        user_id
    }) {
        let {
            eventLocation
        } = poster
        let city = eventLocation.city_with_type
        let settlement = eventLocation.settlement_with_type
        let region = eventLocation.region_with_type
        let area = eventLocation.area_with_type
        let capital_marker = eventLocation.capital_marker
        eventLocation.type = "Point"
        eventLocation.coordinates = [parseFloat(eventLocation.geo_lon), parseFloat(eventLocation.geo_lat)]
        delete eventLocation.geo_lon
        delete eventLocation.geo_lat
        let location = ''
        //! не удалять пробелы в строках
        if (region && capital_marker != 2 && region != city) {
            location = `${region}, `
        }
        if (city) {
            location = `${location}${city}`
        }
        if (area) {
            location = `${location}${area}`
        }
        if (settlement) {
            location = `${location}, ${settlement}`
        }
        //! не удалять пробелы в строках

        let candidateEventLocationInDB = await EventLocationModel.findOne({
            name: location
        })
        if (!candidateEventLocationInDB) {
            await EventLocationModel.create({
                name: location
            })
        }

        poster.eventLocation.name = eventLocation.name
        poster.isDraft = false
        poster.rejected = false
        poster.isModerated = false
        const posterFromDb = await PosterModel.create(poster)

        await UserModel.findByIdAndUpdate(user_id, {
            $push: {
                posters: posterFromDb._id
            }
        })

        logger.info({
            _id: posterFromDb._id.toString()
        }, 'poster created')

        return posterFromDb._id.toString()
    },
    async updatePoster(poster) {
        let _id = poster._id
        delete poster._id

        poster.isModerated = false
        poster.rejected = false

        let posterFromDb = await PosterModel.findOneAndUpdate({
            _id
        }, poster, {
            new: true
        })

        logger.info({
            _id
        }, 'poster updated')

        return posterFromDb._id
    },
    async updateImageUrl(req) {
        let buffer = {
            buffer: req.files[0].buffer,
            name: req.files[0].originalname,
        }
        let posterId = req.query.poster_id

        let posterFromDb = await PosterModel.findById(posterId)
        if (!posterFromDb) {
            posterFromDb = await PosterModel.findById(posterId)
        }
        if (posterFromDb.image) {
            let spl = posterFromDb.image.split('/')
            await s3.Remove(process.env.IMG_PLACE + spl[spl.length - 1])
        }

        let uploadResult = await s3.Upload(buffer, process.env.IMG_PLACE);
        let filename = uploadResult.Location
        let update = await PosterModel.findByIdAndUpdate(posterId, {
            image: filename
        })

        if (!update) {
            await PosterModel.findByIdAndUpdate(posterId, {
                $set: {
                    image: filename
                }
            })
        }

        return filename
    },
    async findMany(filter) {
        let {
            searchText,
            date,
            eventType,
            eventLocation,
            coordinates,
            radius,
            page,
            posterType
        } = filter;
        // console.log(filter);
        const limit = 100;
        const sitePage = page || 1; // Default to page 1 if not provided
        const skip = (sitePage - 1) * limit;

        // Start with the base query for filtering events
        let query = {
            $and: [{
                    isHidden: false
                },
                {
                    isModerated: true
                },
                {
                    isDraft: false
                },
                {
                    rejected: false
                },
                {
                    endDate: {
                        $gte: new Date().setHours(0, 0, 0, 0)
                    }
                }
            ],
            $or: [{
                    endEventDate: {
                        $gte: new Date().setHours(23, 59, 59, 99)
                    }
                },
                {
                    endEventDate: {
                        $exists: false
                    }
                },
                {
                    endEventDate: {
                        $eq: null
                    }
                }
            ]
        };

        // Filter by posterType if provided
        if (posterType) {
            query.$and.push({
                posterType
            });
        }

        // Filter by eventType if provided
        if (eventType?.length) {
            query.$and.push({
                eventType: {
                    $in: eventType
                }
            });
        }

        // Date filtering based on the provided 'date' value
        switch (date) {
            case 'Сегодня':
                query.$and.push({
                    date: {
                        $elemMatch: {
                            $gt: new Date().setHours(0, 0, 0, 0),
                            $lt: new Date().setHours(23, 59, 59, 999)
                        }
                    }
                });
                break;
            case 'На неделе':
                query.$and.push({
                    date: {
                        $elemMatch: {
                            $gt: new Date().setHours(0, 0, 0, 0),
                            $lt: new Date().setHours(23, 59, 59, 999) + 1000 * 60 * 60 * 24 * 7
                        }
                    }
                });
                break;
            case 'Скоро':
                query.$and.push({
                    date: {
                        $elemMatch: {
                            $gt: new Date().setHours(0, 0, 0, 0) + 1000 * 60 * 60 * 24 * 8,
                            $lt: new Date().setHours(23, 59, 59, 999) + 1000 * 60 * 60 * 24 * 30
                        }
                    }
                });
                break;
            case '':
                query.$and.push({
                    $or: [{
                            date: {
                                $eq: []
                            }
                        },
                        {
                            date: {
                                $gt: new Date().setHours(0, 0, 0, 0)
                            }
                        }
                    ]
                });
                break;
            default:
                query.$and.push({
                    date: {
                        $elemMatch: {
                            $gt: new Date(filter.date).setHours(0, 0, 0, 0),
                            $lt: new Date(filter.date).setHours(23, 59, 59, 999)
                        }
                    }
                });
        }

        // Filter by searchText if provided
        if (searchText) {
            query.$and.push({
                $or: [{
                        title: {
                            $regex: searchText,
                            $options: 'i'
                        }
                    },
                    {
                        description: {
                            $regex: searchText,
                            $options: 'i'
                        }
                    },
                    {
                        organizer: {
                            $regex: searchText,
                            $options: 'i'
                        }
                    },
                    {
                        eventType: {
                            $regex: searchText,
                            $options: 'i'
                        }
                    }
                ]
            });
        }

        // Base query for all events (without location/radius)
        let baseQuery = {
            ...query
        };

        // Queries to handle location-specific filtering
        let locationQuery = null;
        let radiusQuery = null;

        // If eventLocation name is provided (without coordinates/radius), use $regex
        if (eventLocation != "") {
            locationQuery = {
                $and: [...baseQuery.$and,
                    {
                        'eventLocation.name': {
                            $regex: eventLocation,
                            $options: 'i'
                        },
                    }
                ], // Copy conditions from baseQuery.$and
                $or: [...baseQuery.$or]
            };
        }

        // If both coordinates and radius are provided, use geospatial search
        if (coordinates && radius != 0 && radius != "") {
            radiusQuery = {
                $and: [...baseQuery.$and, {
                    eventLocation: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
                            },
                            $maxDistance: Number(radius) * 1000 // radius in meters
                        }
                    }
                }], // Copy conditions from baseQuery.$and
                $or: [...baseQuery.$or]
            };
        }

        // Debug: Output queries for inspection
        // console.table(baseQuery);
        // console.table(locationQuery);
        // console.table(radiusQuery);

        // Prepare cursors for base query, location query, and radius query
        const cursorBase = PosterModel.find(baseQuery, null)
            .sort({
                publicationDate: -1,
                date: -1
            })
            .skip(skip)
            .limit(limit)
            .cursor();

        const cursorLocation = locationQuery ? PosterModel.find(locationQuery, null)
            .sort({
                publicationDate: -1,
                date: -1
            })
            .skip(skip)
            .limit(limit)
            .cursor() : null;

        const cursorRadius = radiusQuery ? PosterModel.find(radiusQuery, null)
            .sort({
                publicationDate: -1,
                date: -1
            })
            .skip(skip)
            .limit(limit)
            .cursor() : null;

        // Initialize results array and a Set to track already seen documents
        const results = [];
        const seenDocs = new Set(); // To prevent duplicates

        // Collect results from the base query if no location/radius filtering is provided
        if (!eventLocation && (radius == 0 || radius == "")) {
            // console.log('Using base query');
            for (let doc = await cursorBase.next(); doc != null; doc = await cursorBase.next()) {
                if (!seenDocs.has(doc._id.toString())) {
                    results.push(doc);
                    seenDocs.add(doc._id.toString());
                }
            }
        }

        // Collect results from locationQuery (if defined)
        if (eventLocation != "") {
            // console.log('Using location query');
            for (let doc = await cursorLocation.next(); doc != null; doc = await cursorLocation.next()) {
                if (!seenDocs.has(doc._id.toString())) {
                    results.push(doc);
                    seenDocs.add(doc._id.toString());
                }
            }
        }

        // Collect results from radiusQuery (if defined)
        if (eventLocation != "" && radius != 0 && radius != "") {
            // console.log('Using radius query');
            for (let doc = await cursorRadius.next(); doc != null; doc = await cursorRadius.next()) {
                if (!seenDocs.has(doc._id.toString())) {
                    results.push(doc);
                    seenDocs.add(doc._id.toString());
                }
            }
        }

        return results;
    },

    async find(filter) {
        return PosterModel.find(filter)
    },
    async getById(_id) {
        return PosterModel.findById(_id)
    },
    async deleteOne(poster_id, email) {

        return await PosterModel.deleteOne({
            _id: poster_id
        })
    },
    async findByIdAndHide(poster_id, isHidden) {

        return await PosterModel.findByIdAndUpdate(poster_id, {
            isHidden: isHidden
        })
    },
    async findByIdAndProlong({
        _id,
        publicationStart,
        publicationEnd,
        userId
    }) {


        await UserModel.findByIdAndUpdate(userId, {
            $inc: {
                'subscription.count': -1
            }
        })

        let setEvent = {}
        setEvent._id = userId
        await PosterModel.find({
            _id: _id
        }).then((data) => {
            setEvent.name = data[0].title
        })
        await EventLogService.prolongPostersLog(setEvent)

        return await PosterModel.findByIdAndUpdate(_id, {
            publicationDate: publicationStart,
            endDate: publicationEnd
        })
    },


    async deleteOne(poster_id, email) {
        return await PosterModel.deleteOne({
            _id: poster_id
        })
    },
    deleteMany() {
        return PosterModel.deleteMany({})
    },
    getUserPosters(postersIds) {
        return PosterModel.find({
            _id: {
                $in: postersIds
            }
        })
    },
    getPostersOnModeration(status) {
        if (status == 'rejected') {
            return PosterModel.find({
                rejected: true,
                isDraft: false
            }).sort({
                publicationDate: -1
            })
        } else {
            return PosterModel.find({
                isModerated: false,
                rejected: false,
                isDraft: false
            }).sort({
                publicationDate: -1
            })
        }
    },
    async getManagerPostersOnModeration(status, cities, areas, regions) {
        if (status == 'rejected') {
            return await PosterModel.find({
                rejected: true,
                isDraft: false,
                $or: [{
                        "eventLocation.city_with_type": {
                            $in: cities
                        }
                    },
                    {
                        "eventLocation.area_with_type": {
                            $in: areas
                        }
                    },
                    {
                        "eventLocation.region_with_type": {
                            $in: regions
                        }
                    }
                ]
            }).sort({
                publicationDate: -1
            })

        } else {
            let poster = await PosterModel.find({
                    $or: [{
                            "eventLocation.city_with_type": {
                                $in: cities
                            }
                        },
                        {
                            "eventLocation.area_with_type": {
                                $in: areas
                            }
                        },
                        {
                            "eventLocation.region_with_type": {
                                $in: regions
                            }
                        },
                    ],
                    isModerated: false,
                    rejected: false,
                    isDraft: false
                })
                .sort({
                    publicationDate: -1
                })
            return poster
        }
    },

    async getPosters({
        user_id,
        poster_status
    }) {
        let userFromDb = await UserModel.findById(user_id)
        let posters = []
        switch (poster_status) {
            case 'active':
                posters = await PosterModel
                    .find({
                        $and: [{
                                _id: {
                                    $in: userFromDb.posters
                                },
                                isModerated: true,
                                isDraft: false,
                                rejected: false,
                            },
                            {
                                endDate: {
                                    $gt: Date.now()
                                }
                            },
                            {
                                $or: [{
                                        date: {
                                            $eq: []
                                        }
                                    },
                                    {
                                        date: {
                                            $gt: new Date().setHours(0, 0, 0, 0),
                                        }
                                    }
                                ]
                            },
                            {
                                $or: [{
                                        endEventDate: {
                                            $gte: new Date().setHours(23, 59, 59, 99)
                                        }
                                    },
                                    {
                                        endEventDate: {
                                            $exists: false
                                        }
                                    },
                                    {
                                        endEventDate: {
                                            $eq: null
                                        }
                                    }
                                ]
                            }
                        ],
                    }, )
                    .sort({
                        publicationDate: -1
                    })
                break
            case 'onModeration':
                posters = await PosterModel
                    .find({
                        $and: [{
                            _id: {
                                $in: userFromDb.posters
                            },
                            isModerated: false,
                            isDraft: false,
                            rejected: false,
                        }]
                    })
                    .sort({
                        publicationDate: -1
                    })
                break
            case 'archive':
                posters = await PosterModel
                    .find({
                        $and: [{
                                _id: {
                                    $in: userFromDb.posters
                                },
                                isModerated: true,
                                isDraft: false,
                                rejected: false,
                            },
                            {
                                $or: [{
                                        endDate: {
                                            $lt: Date.now()
                                        }
                                    },
                                    {
                                        date: {
                                            $lt: new Date().setHours(0, 0, 0, 0),
                                        }
                                    }
                                ]
                            },
                            {
                                $or: [{
                                        endEventDate: {
                                            $lt: new Date().setHours(23, 59, 59, 99)
                                        }
                                    },
                                    {
                                        endEventDate: {
                                            $exists: false
                                        }
                                    },
                                    {
                                        endEventDate: {
                                            $eq: null
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                    .sort({
                        publicationDate: -1
                    })
                break
            case 'draft':
                posters = await PosterModel
                    .find({
                        $and: [{
                            _id: {
                                $in: userFromDb.posters
                            },
                            isDraft: true
                        }]
                    })
                    .sort({
                        publicationDate: -1
                    })
                break
            case 'rejected':
                posters = await PosterModel
                    .find({
                        $and: [{
                            _id: {
                                $in: userFromDb.posters
                            },
                            rejected: true,
                            isDraft: false
                        }]
                    })
                    .sort({
                        publicationDate: -1
                    })
                break
        }
        return posters
    },
    async getPostersMiniature({
        organizer,
        poster_id
    }) {
        let posters = await PosterModel
            .find({
                $and: [{
                        _id: {
                            $ne: poster_id
                        },
                        isModerated: true,
                        isDraft: false,
                        rejected: false,
                        isHidden: false
                    },
                    {
                        endDate: {
                            $gt: Date.now()
                        }
                    },
                    {
                        $or: [{
                                date: {
                                    $eq: []
                                }
                            },
                            {
                                date: {
                                    $gt: new Date().setHours(0, 0, 0, 0),
                                }
                            }
                        ]
                    },
                    {
                        $or: [{
                                endEventDate: {
                                    $gte: new Date().setHours(23, 59, 59, 99)
                                }
                            },
                            {
                                endEventDate: {
                                    $exists: false
                                }
                            },
                            {
                                endEventDate: {
                                    $eq: null
                                }
                            }
                        ]
                    }
                ]
            }, )
            .$where(`function() {
                return this.organizer.replace(/[^a-zа-яё]/gi, "").toLowerCase() === '${organizer}'.replace(/[^a-zа-яё]/gi, "").toLowerCase()
            }`)
            .sort({
                publicationDate: -1
            })
        return posters
    },
    async editPoster({
        poster,
        hotfix
    }, _id) {
        let posterFromDb = await PosterModel.findById(_id)

        Object.assign(posterFromDb, poster)

        if (hotfix == 'false') {
            posterFromDb.isDraft = false
            posterFromDb.isModerated = false
            posterFromDb.rejected = false
            logger.info({
                _id
            }, 'poster edited by user')
        }

        return posterFromDb.save()
    },


    async getActiveCategories(location, radius, coordinates) {
        const currentDate = new Date().setHours(0, 0, 0, 0);
        const queryBase = {
            $and: [{
                    isHidden: false
                },
                {
                    isModerated: true
                },
                {
                    isDraft: false
                },
                {
                    rejected: false
                },
                {
                    endDate: {
                        $gt: Date.now()
                    }
                },
                {
                    $or: [{
                            date: {
                                $eq: []
                            }
                        },
                        {
                            date: {
                                $gt: currentDate
                            }
                        }
                    ]
                }
            ]
        };

        let locationResults = [];
        let coordinatesResults = [];
        let baseResults = [];

        // Поиск по координатам
        //MongoDB накладывает ограничения на использование $near в сочетании с другими операторами в одном $or или $and запросе
        if (coordinates.length) {
            const coordinatesQuery = {
                ...queryBase,
                eventLocation: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        $maxDistance: radius * 1000 // Радиус в метрах
                    }
                }
            };
            coordinatesResults = await PosterModel.find(coordinatesQuery);
        }

        // Поиск по названию локации
        if (location) {
            const locationQuery = {
                ...queryBase,
                'eventLocation.name': {
                    $regex: location,
                    $options: 'i'
                }
            };
            locationResults = await PosterModel.find(locationQuery);
        } else {
            baseResults = await PosterModel.find(queryBase);
        }

        // Объединение результатов и удаление дубликатов
        const activePosters = [...coordinatesResults, ...locationResults, ...baseResults];
        const uniquePosters = _.uniqBy(activePosters, '_id'); // Убираем дубликаты по уникальному _id

        const typesArray = uniquePosters.map(item => item.eventType).flat();
        const uniqTypes = _.uniq(typesArray);

        return uniqTypes;
    },

    async getActiveCities() {
        let activePosters = await PosterModel.find({
            $and: [{
                    isHidden: false
                },
                {
                    isModerated: true
                },
                {
                    isDraft: false
                },
                {
                    rejected: false,
                },
                {
                    endDate: {
                        $gt: Date.now()
                    }
                },
                {
                    $or: [{
                            date: {
                                $eq: []
                            }
                        },
                        {
                            date: {
                                $gt: new Date().setHours(0, 0, 0, 0),
                            }
                        }
                    ]
                }
            ]
        }, {
            'eventLocation.name': 1,
            'eventLocation.city_with_type': 1,
            'eventLocation.settlement_with_type': 1,
            'eventLocation.coordinates': 1,
        })
        //.split(', ').filter((item)=>(item[0]!='у' && item[1]!='л' || item[2]!=' ') && (item[0]!='д' || item[1]!=' ')).join(', ')
        let typesArray = activePosters
            .map(item => item.eventLocation.city_with_type ? {
                name: item.eventLocation.city_with_type,
                coordinates: item.eventLocation?.coordinates,
                fullLocation: item.eventLocation?.name.split(', ').filter((item) => (item[0] != 'у' && item[1] != 'л' || item[2] != ' ') && (item[0] != 'д' || item[1] != ' ')).join(', ')
            } : {
                name: item.eventLocation.settlement_with_type,
                coordinates: item.eventLocation?.coordinates,
                fullLocation: item.eventLocation?.name.split(', ').filter((item) => (item[0] != 'у' && item[1] != 'л' || item[2] != ' ') && (item[0] != 'д' || item[1] != ' ')).join(', ')
            })
            .flat()
        let uniqTypes = _.uniqBy(typesArray, 'name').sort()

        return uniqTypes
    }
}