const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_API_TOKEN
const chat_id = process.env.TELEGRAM_CHAT_ID

const bot = new TelegramBot(token, { polling: true })

module.exports = {
    async sendPost(poster) {
        try {
            console.log(process.env.CLIENT_URL + '/post?_id=' + poster._id)
            await bot.sendPhoto(
                chat_id, 
                poster.image, 
                { 
                    caption: `<a href="${process.env.CLIENT_URL + '/post?_id=' + poster._id}">${poster.title}</a>`, parse_mode: 'HTML' 
                }
            )
        } catch(error) {
            console.error(error)
        }
    }
}