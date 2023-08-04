const { Schema, model } = require(`mongoose`);

const blackSchema = new Schema({
	userId: {
        type: Number,
        required: true,
        unique: true
    },
    reason: String
});

const Black = model('black', blackSchema, 'blackList');


module.exports = Black;