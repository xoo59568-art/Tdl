// plugins/facebook.js

const axios = require("axios");

const api = axios.create({
  timeout: 180000,
  maxRedirects: 10,
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

module.exports = (bot) => {

  bot.on("message", async (msg) => {

    try {

      const text = msg.text;
      if (!text) return;

      // command ignore
      if (text.startsWith("/")) return;

      // fb link check
      if (
        !text.includes("facebook.com") &&
        !text.includes("fb.watch")
      ) return;

      const chatId = msg.chat.id;

      const wait = await bot.sendMessage(
        chatId,
        "🔍 Downloading Facebook Video..."
      );

      // API REQUEST
      const { data } = await api.get(
        `https://rabbitapi.nett.to/api/fb?url=${encodeURIComponent(text)}`
      );

      console.log("FB RESPONSE =>");
      console.log(JSON.stringify(data, null, 2));

      await bot.deleteMessage(chatId, wait.message_id);

      const hd =
        data?.result?.hd ||
        data?.hd;

      const sd =
        data?.result?.sd ||
        data?.sd;

      const title =
        data?.result?.title ||
        data?.title ||
        "Facebook Video";

      // pick best quality
      const videoUrl = hd || sd;

      if (!videoUrl) {
        return bot.sendMessage(
          chatId,
          "❌ Video Not Found"
        );
      }

      console.log("📥 Downloading Video...");

      // stream download
      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
        timeout: 180000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      try {

        console.log("📤 Sending Video...");

        await bot.sendVideo(
          chatId,
          response.data,
          {
            caption:
              `🎬 ${title}`,

            supports_streaming: true
          }
        );

      } catch (err) {

        console.log(
          "❌ sendVideo failed -> sendDocument"
        );

        await bot.sendDocument(
          chatId,
          response.data,
          {
            caption:
              `🎬 ${title}`
          }
        );
      }

    } catch (err) {

      console.log("FB ERROR =>", err);

      bot.sendMessage(
        msg.chat.id,
        "❌ Facebook Download Failed"
      );
    }
  });
};
