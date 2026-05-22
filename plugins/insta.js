// plugins/instagram.js

const axios = require("axios");

const api = axios.create({
  timeout: 180000,
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

module.exports = (bot) => {

  bot.on("message", async (msg) => {

    try {

      const text = msg.text;

      if (!text) return;

      if (text.startsWith("/")) return;

      if (!text.includes("instagram.com")) return;

      const chatId = msg.chat.id;

      const wait = await bot.sendMessage(
        chatId,
        "🔍 Downloading Instagram..."
      );

      const { data } = await api.get(
        `https://rabbitapi.nett.to/api/insta?url=${encodeURIComponent(text)}`
      );

      console.log(
        JSON.stringify(data, null, 2)
      );

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      const media =
        data?.result?.url ||
        data?.url;

      if (!media) {

        return bot.sendMessage(
          chatId,
          "❌ Media not found"
        );
      }

      // try as normal video
      try {

        return await bot.sendVideo(
          chatId,
          media,
          {
            supports_streaming: true
          }
        );

      } catch {}

      // if not video then send photo
      return await bot.sendPhoto(
        chatId,
        media
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        msg.chat.id,
        "❌ Instagram failed"
      );
    }
  });
};
