const axios = require('axios')
const { VK, Upload, API } = require('vk-io');

const api = new API({
    token: process.env.VK_ACCESS_TOKEN
});
const vk = new VK({
    token: process.env.VK_ACCESS_TOKEN
});
const upload = new Upload({
    api
});

module.exports = {
    async postInGroup(message, poster) {
 
        const image = await upload.wallPhoto({
            source: {
                value: poster.image
            }
        })    
        const response = await vk.api.wall.post({
            message:`${poster.eventType.join('|')}  ${poster.title}`,
            owner_id:-222755810,
            from_group:1,
            attachments: `${image}, ${message}`
        });
  
        return response
        // let response = await axios.post(`https://api.vk.com/method/wall.post?access_token=${process.env.VK_ACCESS_TOKEN}&v=5.131&attachments=attachments&message=${poster.eventType.join('|')} ${poster.title}&owner_id=-222755810&from_group=1`)
    
        // return response
    }
} 

// `https://oauth.vk.com/authorize?client_id=-51783056&scope=manage&redirect_uri=http://localhost:3031&response_type=token`
// https://oauth.vk.com/access_token?client_id=51783056&client_secret=Hn2RIxtq3uzc3Vl0KAgI&redirect_uri=http://localhost:3031&code=0a6421a65a4a8219e6

// https://oauth.vk.com/authorize?client_id=-51783056&display=page&redirect_uri=http://localhost:3031&scope=wall&response_type=token&v=5.154

// module.exports = process.env.NODE_ENV == 'production' ? {
//     async postInGroup(message) {
//         let response = await axios.post(`https://api.vk.com/method/wall.post?access_token=${process.env.VK_ACCESS_TOKEN}&v=5.131&attachments=${message}&message=${message}&owner_id=-222755810&from_group=1`)
//         return response
//     }
// } : { async postInGroup(message) { } }