const posterModel = require("../models/poster-model")
const apiService = require('../service/api-service')
const { sendMail } = require('../middleware/mailer')
module.exports = {
    async getAll(req, res, next) {
        try {

        
            return res.json(await apiService.getAll(req.body.query))
        } catch (error) {
            next(error)
        }
    },
    async getTypes(req, res, next) {
         return  res.json(await apiService.getTypes())
    },
    async sendEmail(req, res, next) {

        return res.json(await sendMail(req.body.emailHtml.html, ['grachevrv@ya.ru'], 'Новый пользователь хакатон')) 
   }
}