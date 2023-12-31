const axios = require('axios')

module.exports = process.env.NODE_ENV == 'production' ? {
    async postInGroup(message, postTitle) {
        let response = await axios.post(`https://api.vk.com/method/wall.post?access_token=${process.env.VK_ACCESS_TOKEN}&v=5.131&attachments=${message}&message=${postTitle}&owner_id=-222755810&from_group=1`)
        return response
    }
} : { async postInGroup(message) { } }

// `https://oauth.vk.com/authorize?client_id=-51783056&scope=manage&redirect_uri=http://localhost:3031&response_type=token`
// https://oauth.vk.com/access_token?client_id=51783056&client_secret=Hn2RIxtq3uzc3Vl0KAgI&redirect_uri=http://localhost:3031&code=0a6421a65a4a8219e6

// https://oauth.vk.com/authorize?client_id=-51783056&display=page&redirect_uri=http://localhost:3031&scope=wall&response_type=token&v=5.154