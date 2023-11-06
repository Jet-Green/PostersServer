const { Schema, model } = require('mongoose');

const PlatformSchema = new Schema({
    isOwned: { type: Boolean },
    // Тип площадки. Возможные значения: is - Информационная система; apps - Приложение; site - Сайт.
    type: { type: String, enum: ['is', 'apps', 'site'] },
    name: { type: String },
    url: { type: String }
})

module.exports = model('Platform', PlatformSchema);
