// plugins/spotify.js

const axios = require("axios");

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

  /* AUTO SPOTIFY URL DETECT */

  bot.on("message", async (msg) => {

    try {

      const chatId = msg.chat.id;
      const text = msg.text;

      /* CHECK TEXT */

      if (!text) return;

      /* CHECK SPOTIFY TRACK URL */

      if (
        !text.includes("open.spotify.com/track/")
      ) return;

      /* WAIT MESSAGE */

      const wait = await bot.sendMessage(
        chatId,
        "🔍 Downloading Spotify Song..."
      );

      /* API REQUEST */

      const { data } = await api.get(
        `https://rabbitapi.nett.to/api/spotify?url=${encodeURIComponent(text)}`
      );

      console.log(
        JSON.stringify(data, null, 2)
      );

      /* DELETE WAIT */

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      /* RESPONSE */

      const res = data?.response;

      if (!res?.status) {

        return bot.sendMessage(
          chatId,
          "❌ Spotify download failed"
        );
      }

      /* GET AUDIO URL */

      const audio = res?.url;

      if (!audio) {

        return bot.sendMessage(
          chatId,
          "❌ Audio not found"
        );
      }

      /* SONG INFO */

      const title =
        res?.title ||
        "Spotify Song";

      const artist =
        res?.artist ||
        "Unknown";

      /* SEND AUDIO */

      try {

        await bot.sendAudio(
          chatId,
          audio,
          {
            title,
            performer: artist
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
            fileName: `${title}.mp3`
          }
        );
      }

    } catch (err) {

      console.log(
        "Spotify Plugin Error:",
        err
      );

      bot.sendMessage(
        msg.chat.id,
        "❌ Spotify download failed"
      );
    }
  });
};
