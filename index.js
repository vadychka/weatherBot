const TelegramApi = require('node-telegram-bot-api')
const CronJob = require('cron').CronJob;
const mongoose = require('mongoose')
const userModel = require("./models");
const validator = require('validator');
const { sentWeather, addNewSubscribe } = require('./services');
require('dotenv').config()

mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGODB_URL)

const bot = new TelegramApi(process.env.TOKEN, {polling:true})

bot.setMyCommands([
    {command:'/start', description:'Get weather in your region.'}
])

bot.on('message', async(msg)=>{
  const chatId = msg.chat.id
  const checkAvailableData = await userModel.findOne({'chatId': chatId})

  if(!checkAvailableData){

    const timePrompt = await bot.sendMessage(chatId, 'Write time for subscribe [example: HH:MM]', {
      reply_markup: {force_reply: true}})
      
    await bot.onReplyToMessage(msg.chat.id, timePrompt.message_id, async (nameMsg) => {
      const userTime = nameMsg.text;

        if(validator.isTime(userTime)){

          bot.sendMessage(chatId, "Great, now we need your geolocation", {
            reply_markup: JSON.stringify({
                  keyboard: [[{text: 'Location', request_location: true}]],
                  resize_keyboard: true,
                  one_time_keyboard: true,
                }),
          });
          addNewSubscribe(chatId, `${userTime}`)
        }
    })
  }
})

bot.on('location', async(msg)=>{
  const chatId = msg.chat.id
  const userLat = msg.location.latitude
  const userLon = msg.location.longitude

  await userModel.findOneAndUpdate({'chatId': chatId},{'lat': userLat , 'lon': userLon})
});

const job = new CronJob(
	'0 */1 * * * *',
	async function () {
    const moment = require('moment')
    const now = new moment();
  
    userModel.find({}, async (err, users)=>{
      users.forEach(user => {
        user.time === now.format("HH:mm") && sentWeather(user, bot)
      })
    })
	},
	null, true, process.env.TZ
);
