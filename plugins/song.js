// plugins/song.js

const axios = require("axios");
const yts = require("yt-search");

/* =========================
   AXIOS API
========================= */

const api = axios.create({
  timeout: 180000,
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

module.exports = (bot) => {

  bot.onText(/^\/song (.+)/, async (msg, match) => {

    try {

      const chatId = msg.chat.id;
      const query = match[1];

      /* WAIT MESSAGE */

      const wait = await bot.sendMessage(
        chatId,
        "🔍 Searching Song..."
      );

      /* SEARCH YOUTUBE */

      const search = await yts(query);
      const first = search.videos[0];

      if (!first) {

        return bot.editMessageText(
          "❌ Song not found",
          {
            chat_id: chatId,
            message_id: wait.message_id
          }
        );
      }

      /* API REQUEST */

      const { data } = await api.get(
        `https://rabbitapi.nett.to/api/song?url=${encodeURIComponent(first.url)}`
      );

      console.log(
        JSON.stringify(data, null, 2)
      );

      /* DELETE WAIT MESSAGE */

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      /* GET AUDIO URL */

      const audio =
        data?.result?.url ||
        data?.result?.audio ||
        data?.result?.mp3 ||
        data?.result?.download ||
        data?.url;

      if (!audio) {

        return bot.sendMessage(
          chatId,
          "❌ Audio not found"
        );
      }

      /* SEND AUDIO */

      try {

        await bot.sendAudio(
          chatId,
          audio,
          {
            title: first.title,
            performer: first.author.name
          }
        );

      } catch (err) {

        console.log(
          "Audio Error:",
          err.message
        );

        /* FALLBACK DOCUMENT */

        await bot.sendDocument(
          chatId,
          audio,
          {
            fileName: `${first.title}.mp3`
          }
        );
      }

    } catch (err) {

      console.log(
        "Song Plugin Error:",
        err
      );

      bot.sendMessage(
        msg.chat.id,
        "❌ Song download failed"
      );
    }
  });
};
