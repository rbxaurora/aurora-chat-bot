const Black = require(`./models/Black`);
const Anket = require(`./models/Anket`);
const Session = require(`./models/Session`);
const axios = require(`axios`);
const createDebug = require(`debug`);

class controller {
	async start (ctx) {
		const chatId = ctx.message.chat.id;
		const userId = ctx.message.from.id;
		const userName = ctx.message.from.first_name;

		const user = await Black.findOne({ userId: userId });

		if (user) {
			return ctx.telegram.sendMessage(chatId, `❌Вы находитесь в Черном списке Хауса и потенциально опасных пользователей.\n\nДоступ к чат-боту <b>запрещен</b>.`, {
				parse_mode: 'HTML'
			});
		}

		ctx.telegram.sendMessage(chatId, `<b>Здравствуйте, ${userName}👋</b>\nВас приветствует ${ctx.botInfo.first_name} для обратной связи с администрацией AURORA TEAM. Здесь Вы можете обратиться по любому вопросу или попасть в Хаус.\n\nℹЧтобы начать анкетирование, нажмите на кнопку "Вступить в Хаус", которая появится ниже.\n\n<i>‼Важно: Анкеты, содержание которых носит оскорбительный характер, или не имеет никакого отношения к анкетированию, рассмотрению не подлежат и будут отклонены администрацией Хауса.</i>`, {
			parse_mode: 'HTML'
		});

		return ctx.telegram.sendMessage(chatId, `✨Для того, чтобы начать заполение анкеты, пожалуйста, нажмите на кнопку ниже. \n\nВажно: Пожалуйста, нажмите на кнопку только 1 раз!`, {
			reply_markup: {
				inline_keyboard: [
					[{
						text: 'Начать заполнение анкеты',
						callback_data: 'anketa'
					}]
				]
			},
			parse_mode: 'HTML'
		});
	}

	async callbackQuery (ctx) {
		const chatId = ctx.callbackQuery.message.chat.id;
		const userId = ctx.callbackQuery.from.id;
		const data = ctx.callbackQuery.data;
		const queryId = ctx.callbackQuery.id;
		const msgId = ctx.callbackQuery.message.message_id;

	    const user = await Anket.findOne({ userId: userId });

	    if (data == 'anketa' && user) {
	    	return ctx.telegram.answerCbQuery(queryId, `⛔Вы уже заполняли анкету!`);
	    }
	    
	    if (data == `anketa` && !user) {
	        return this.anketa(ctx);
	    }
	    
	    if (data.includes(`accept`)) {
	        return this.acceptAnket(ctx);
	    }

	    if (data.includes(`decline`)) {
	        return this.declineAnket(ctx);
	    }

	    if (data.includes(`notage`)) {
	        return this.declineNotAge(ctx);
	    }

	    if (data.includes(`noanket`)) {
	        return this.declineNoAnket(ctx);
	    }

	    if (data.includes(`blacklist`)) {
	        return this.declineBlack(ctx);
	    }

	    if (data == 'roblox_NO') {
	    	await ctx.telegram.deleteMessage(chatId, msgId);
	    	return ctx.telegram.sendMessage(chatId, `💌Вопрос || 5\n\nВведите Ваш ник в Roblox.`);
	    }

	    if (data == 'roblox_YES') {
	    	await ctx.telegram.deleteMessage(chatId, msgId);

	    	const session = await Session.findOne({ user_id: userId });
	    	await Anket.updateOne({ userId: userId }, { $set: {
	    		question: 6,
	    		roblox: session?.roblox
	    	} });

	    	await Session.deleteOne({ user_id: userId });

	    	return ctx.telegram.sendMessage(chatId, `💌Вопрос || 6\n\nВведите Ваш стиль скина.`);
	    }
	}

	async anketa (ctx) {
		const chatId = ctx.callbackQuery.message.chat.id;
		const userId = ctx.callbackQuery.from.id;
		ctx.telegram.sendMessage(chatId, `✅<b>Готовим форму для заполнения анкеты!</b>\n<i>Пожалуйста, заполняйте форму внимательно и без ошибок, иначе бот отклонит Вашу анкету и Вы не сможете перезаполнить анкету.</i>\n\n💌В ответах не должно быть стикеров, фото, видео и GIF-картинок.`, {
            parse_mode: 'HTML'
        });

        let question = `💌Вопрос || 1\n\nВведите Ваше имя.`;

        const user = new Anket({
            userId: userId,
            question: 1
        });

        await user.save();

        setTimeout(async () => {
            ctx.telegram.sendMessage(chatId, question);
        }, 5000);
	}

	async anketUpdate (ctx) {
		const chatId = ctx.message.chat.id;
		const userId = ctx.message.from.id;

		const user = await Anket.findOne({ userId: userId });

		if (user.question == 1) {
			let name = ctx.message.text;
			let question = `💌Вопрос || 2\n\nВведите Ваш возраст.`;

			await Anket.updateOne({ userId: userId }, { $set: { question: 2, name: name } });
			return ctx.telegram.sendMessage(chatId, question);
		}

		if (user.question == 2) {
			if (isNaN(ctx.message.text)) {
				return ctx.telegram.sendMessage(chatId, `<b>❌Введеный ответ является некорректным. Пожалуйста, введите возраст цифрами.</b>`, {
                    parse_mode: 'HTML'
                });
			}

			let age = ctx.message.text;
			let question = `💌Вопрос || 3\n\nНа сколько Вы готовы проявлять активность в нашем Хаусе?`;

			await Anket.updateOne({ userId: userId }, { $set: { question: 3, age: age } });
			return ctx.telegram.sendMessage(chatId, question);
		}

		if (user.question == 3) {
			let activity = ctx.message.text;
			let question = `💌Вопрос || 4\n\nВведите Ваш ник в TikTok.`;

			await Anket.updateOne({ userId: userId }, { $set: { question: 4, activity: activity } });
			return ctx.telegram.sendMessage(chatId, question);
		}

		if (user.question == 4) {
			let tiktok = ctx.message.text;
            let question = `💌Вопрос || 5\n\nВведите Ваш ник в Roblox.`;

            await Anket.updateOne({ userId: userId }, { $set: { question: 5, tiktok: tiktok } });
            return ctx.telegram.sendMessage(chatId, question);
		}

		if (user.question == 5) {
			let roblox = ctx.message.text;
			let msgId;
            let question = `💌Вопрос || 6\n\nВведите Ваш стиль скина.`;

            const res = await ctx.telegram.sendMessage(chatId, `<i>Формирование запроса...</i>`, {
            	parse_mode: 'HTML'
            });
            msgId = res.message_id;

            setTimeout(async () => {
            	const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
	            	usernames: [`${roblox}`],
	            	excludeBannedUsers: true
	            });

            	ctx.telegram.editMessageText(chatId, msgId, undefined, `<i>Поиск аккаунта по запросу: ${roblox}...</i>`, {
            		parse_mode: 'HTML'
            	});

	            setTimeout(async () => {
	            	if (!response.data.data[0]) {
		            	ctx.telegram.deleteMessage(chatId, msgId);
		            	return ctx.telegram.sendMessage(chatId, `❌Данного пользователя не существует в Roblox. Пожалуйста, введите корректный ник в Roblox!`);
		            }

		            const req = {
		            	user_id: userId,
		            	roblox: roblox
		            };
		            const session = new Session(req);

		            await session.save();
		          
	            	return ctx.telegram.editMessageText(chatId, msgId, undefined, `Дисплей ник: <b>${response.data.data[0].displayName}</b>\nНикнейм: <b>${response.data.data[0].name}</b>\nID: <b>${response.data.data[0].id}</b>\n\n<i>Это Ваш аккаунт?</i>`, {
	            		reply_markup: {
	            			inline_keyboard: [
	            				[{
	            					text: '✅Да',
	            					callback_data: 'roblox_YES'
	            				},
	            				{
	            					text: '⛔Нет',
	            					callback_data: 'roblox_NO'
	            				}]
            				]
	            		},
	            		parse_mode: 'HTML'
	            	});
	            }, 1000)
            }, 1000);
		}
	}

	async acceptAnket (ctx) {
		
	}

	async declineAnket (ctx) {
		
	}

	async declineNotAge (ctx) {
		
	}

	async declineNoAnket (ctx) {
		
	}

	async declineBlack (ctx) {
		
	}
}


module.exports = new controller()