// plugins/song.js

const axios = require("axios");
const yts = require("yt-search");

const api = axios.create({
  timeout: 180000, // 3 minute
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

module.exports = (bot) => {

  bot.on("message", async (msg) => {

    try {

      const text = msg.text;

      if (!text) return;

      if (!text.startsWith("/song ")) return;

      const query = text.slice(6).trim();

      if (!query) {

        return bot.sendMessage(
          msg.chat.id,
          "❌ Song name needed"
        );
      }

      const chatId = msg.chat.id;

      const wait = await bot.sendMessage(
        chatId,
        "🔍 Searching Song..."
      );

      // youtube search
      const search = await yts(query);

      const video = search.videos[0];

      if (!video) {

        await bot.deleteMessage(
          chatId,
          wait.message_id
        );

        return bot.sendMessage(
          chatId,
          "❌ Song not found"
        );
      }

      console.log(
        "YT FOUND =>",
        video.title
      );

      // api request
      const { data } = await api.get(
        `https://rabbitapi.nett.to/api/song?url=${encodeURIComponent(video.url)}`
      );

      console.log(
        JSON.stringify(data, null, 2)
      );

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      const audio =
        data?.response?.result?.url ||
        data?.response?.result?.mp3 ||
        data?.response?.result?.audio ||
        data?.response?.result?.download;

      if (!audio) {

        return bot.sendMessage(
          chatId,
          "❌ Audio not found"
        );
      }

      // send audio
      return await bot.sendAudio(
        chatId,
        audio,
        {
          timeout: 180000, // 3 minute
          title: video.title,
          performer: video.author.name
        }
      );

    } catch (err) {

      console.log(
        "SONG ERROR =>",
        err
      );

      bot.sendMessage(
        msg.chat.id,
        "❌ Song failed"
      );
    }
  });
};
