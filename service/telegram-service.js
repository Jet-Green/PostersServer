const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_API_TOKEN
const chat_id = process.env.TELEGRAM_CHAT_ID

let bot;

if (process.env.NODE_ENV == 'production') {
    bot = new TelegramBot(token, { polling: true })
}
// экспортирую объект с пустыми функциями, если если мод development
let toExport = process.env.NODE_ENV == 'production' ? {
    async sendPost(poster) {
        try {
            await bot.sendPhoto(
                chat_id,
                poster.image,
                {
                    caption: `<a href="${process.env.CLIENT_URL + '/post?_id=' + poster._id}">${poster.eventType.join(' | ')}   "${poster.title}" </a>`, parse_mode: 'HTML'
                }
            )
        } catch (error) {
            console.error(error)
        }
    }
} : { async sendPost(poster) { return } }

module.exports = toExport