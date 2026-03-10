const nodemailer = require('nodemailer')

const EMAIL_TRANSPORT = 'smtps://formtomail@ya.ru:upxltbiontzsnnmw@smtp.ya.ru'
const EMAIL_ADDRESS = 'formtomail@ya.ru'

const transporter = nodemailer.createTransport(EMAIL_TRANSPORT, { from: `Григорий Дзюин <${EMAIL_ADDRESS}>` })

module.exports = {
    async sendMail(html, emails = [], emailSubject) {
        // let emailTemplateSource = fs.readFileSync(path.join('templates', templateName)).toString()

        // const template = Handlebars.compile(emailTemplateSource)

        // const htmlToSend = template(data)

        // let sendTo;
        // switch (type) {
        //     case 'multiple':
        //         sendTo = _.uniq(['grishadzyin@gmail.com', 'grachevrv@yandex.ru', ...emails])
        //         break
        //     case 'single':
        //         sendTo = emails[0]
        //         break
        // }


        // let emailSubject;
        // switch (templateName) {
        //     case 'reset-password.hbs':
        //         emailSubject = 'Восстановление пароля'
        //         break;
        //     case 'create-trip.hbs':
        //         emailSubject = 'Создана поездка'
        //         break;
        // }


        let details = {
            from: EMAIL_ADDRESS,
            to: [...emails],
            subject: emailSubject,
            html: html,
        }
        let r = await transporter.sendMail(details)
        return r
    }
}