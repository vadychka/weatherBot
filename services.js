const axios = require('axios');
const userModel = require("./models/user");

module.exports.addNewSubscribe = (chatId, time)=> {
    const newUser = new userModel({
      chatId,
      time
    })
    newUser.save()
  }

  module.exports.sentWeather = async(user, bot)=> {
    const getWeather = await axios(`https://api.openweathermap.org/data/2.5/weather?lat=${user.lat}&lon=${user.lon}&appid=${process.env.WEATHER_KEY}&units=metric`)
  
    const temp = getWeather.data.main.temp.toFixed(1)
    const place = getWeather.data.name
    const typeOfWeather = getWeather.data.weather[0].main
  
    bot.sendMessage(user.chatId, `Temperature in ${place} is ${temp} degree (${typeOfWeather})`)
  }