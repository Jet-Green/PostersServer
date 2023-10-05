const OrdModel = require('../models/ord-model.js')
const UserModel = require('../models/user-model.js')
const axios = require('axios');

const YA_ORD_OAuth = process.env.YA_ORD_OAuth
const YA_ORD_URL = process.env.YA_ORD_URL

module.exports = {
    async getOrdState() {
        let allStates = await OrdModel.find({})
        if (allStates.length == 0) {
            return await OrdModel.create({ organisation: {} })
        }
        return allStates[0]
    },
    async createOrganisation(form) {

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
        // this.contract(form.form.contract)

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
    async platforms(form) {

    },
    async contract(form) {
        axios({
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

}

