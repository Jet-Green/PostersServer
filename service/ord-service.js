const OrdModel = require('../models/ord-model.js')
const UserModel = require('../models/user-model.js')
const PlatformModel = require('../models/platform-model.js')

const PosterModel = require('../models/poster-model.js')
const axios = require('axios');

const YA_ORD_OAuth = process.env.YA_ORD_OAuth
const YA_ORD_URL = process.env.YA_ORD_URL

module.exports = {
    async getOrdState() {
        let allStates = await OrdModel.find({})
        if (allStates.length == 0) {
            return await OrdModel.create({ organization: {} })
        }
        return allStates[0]
    },
    async createOrganization(form) {
        let res = await OrdModel.findOneAndUpdate({}, { organization: form })
        await this.organization(form)
        return res
    },
    async createContract(form) {
        await UserModel.findByIdAndUpdate(form.userId, {
            $push: {
                contracts: form.form
            }
        })
        // отправка в ОРД
        this.contract(form.form.contract)

    },
    async createPlatform({ platforms }) {
        return PlatformModel.create(platforms[0])
    },
    // ОРД Яндекс методы
    async organization(form) {
        axios({
            method: 'post',
            url: `${YA_ORD_URL}organization`,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${YA_ORD_OAuth}`
            },
            data: form

        });
    },
    async platforms(toSend) {
        let res = await axios({
            method: 'post',
            url: `${YA_ORD_URL}platforms`,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${YA_ORD_OAuth}`
            },
            data: toSend
        });
        if (res.status == 200) {
            return await OrdModel.findOneAndUpdate({}, { $push: { 'organization.platforms': toSend.platforms[0] } })
        }
    },
    async contract(form) {
        let res = await axios({
            method: 'post',
            url: `${YA_ORD_URL}contract`,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${YA_ORD_OAuth}`
            },
            data: form

        });
    },
    async creative(posterFromDb, posterImage, urls) {
        let creatorFromDb = await UserModel.findById(posterFromDb.creator, { contracts: 1 })

        let contract;
        for (let c of creatorFromDb.contracts) {
            if (c.name == posterFromDb.contract) {
                contract = c
            }
        }

        if (!contract) contract = creatorFromDb.contracts[0]

        let toSend = {
            "id": posterFromDb._id,
            "contractId": contract.contract.id,
            "description": posterFromDb.description,
            "type": "other",
            "form": "video",
            "urls": urls,
            "okveds": [
                contract.okved
            ],
            "mediaData": [
                {
                    "mediaUrl": posterImage,
                    "description": "Афиша мероприятия"
                }
            ],
            "fiasRegionList": [],
            "isSocial": false,
            "isNative": false
        }

        let res = await axios({
            method: 'post',
            url: `${YA_ORD_URL}creative`,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${YA_ORD_OAuth}`
            },
            data: toSend
        });

        if (res.status == 200) {
            let { erir_ids } = res.data
            return await PosterModel.findByIdAndUpdate(posterFromDb._id, { $set: { erir_ids: erir_ids } })
        }
    },
}

