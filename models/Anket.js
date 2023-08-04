const { Schema, model } = require(`mongoose`);

const anketSchema = new Schema({
	userId: {
        type: Number,
        required: true,
        unique: true
    },
    name: String,
    question: Number,
    age: Number,
    activity: String,
    tiktok: String,
    roblox: String,
    skin: String,
    phone: String,
    whyus: String,
    status: String
}, { timestamps: true });

const Anket = model('anket', anketSchema, 'anketList');


module.exports = Anket;