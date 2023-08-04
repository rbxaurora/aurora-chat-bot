const express = require(`express`);
const app = express();
const mongoose = require(`mongoose`);
const { Telegraf, session } = require(`telegraf`);
const { Mongo } = require(`@telegraf/session/mongodb`);
const { message } = require(`telegraf/filters`);
const createDebug = require(`debug`);
require(`dotenv`).config();
const controller = require(`./controller`);

const port = process.env.PORT || 3005;

app.listen(port, () => {
	console.log(`Server is listening on port: ${port}`);
});

mongoose.connect(process.env.DB_PASS);

const bot = new Telegraf(process.env.BOT_TOKEN);

app.get(`/`, (req, res) => {
	res.send(`Bot is working successfully!`);
});

const store = Mongo({
	url: process.env.DB_PASS
});

bot.use(session({ store }));

bot.start((ctx) => controller.start(ctx));
bot.on('callback_query', (ctx) =>  controller.callbackQuery(ctx));
bot.on(message("text"), (ctx) => {
	if (ctx.message.chat.id == 1762065697) {
		controller.anketUpdate(ctx);
	}
});

bot.launch();

// STOP
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));