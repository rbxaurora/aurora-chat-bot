const { Schema, model } = require(`mongoose`);

const sessionSchema = new Schema({
	user_id: {
		type: Number,
		required: true,
		unique: true
	},
	roblox: String
});

const Session = model(`session`, sessionSchema, 'telegraf-sessions');


module.exports = Session;