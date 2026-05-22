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

  bot.onText(/^\/spotify (.+)/, async (msg, match) => {

    try {

      const chatId = msg.chat.id;
      const url = match[1];

      /* CHECK URL */

      if (!url.includes("spotify.com")) {

        return bot.sendMessage(
          chatId,
          "❌ Give a valid Spotify track URL"
        );
      }

      /* WAIT MESSAGE */

      const wait = await bot.sendMessage(
        chatId,
        "🔍 Downloading Spotify Song..."
      );

      /* API REQUEST */

      const { data } = await api.get(
        `https://rabbitapi.nett.to/api/spotify?url=${encodeURIComponent(url)}`
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

      /* AUDIO URL */

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

        /* FALLBACK */

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
