// plugins/song.js

const axios =
  require("axios");

const yts =
  require("yt-search");

/* =========================
   API
========================= */

const api =
  axios.create({

    timeout: 180000,

    headers: {
      "User-Agent":
        "Mozilla/5.0"
    }
  });

module.exports = (bot) => {

  bot.onText(
    /^\/song (.+)/,

    async (
      msg,
      match
    ) => {

      try {

        const chatId =
          msg.chat.id;

        const query =
          match[1];

        /* WAIT */

        const wait =
          await bot.sendMessage(
            chatId,
            "🔍 Searching Song..."
          );

        /* SEARCH YOUTUBE */

        const search =
          await yts(query);

        const first =
          search.videos[0];

        if (!first) {

          return bot.editMessageText(
            "❌ Song not found",
            {
              chat_id:
                chatId,

              message_id:
                wait.message_id
            }
          );
        }

        /* API REQUEST */

        const {
          data
        } = await api.get(

`https://rabbitapi.nett.to/api/song?url=${encodeURIComponent(first.url)}`
        );

        console.log(
          JSON.stringify(
            data,
            null,
            2
          )
        );

        await bot.deleteMessage(
          chatId,
          wait.message_id
        );

        /* AUDIO URL */

        const audio =
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
            audio
          );

        } catch {

          /* FALLBACK */

          await bot.sendDocument(
            chatId,
            audio
          );
        }

      } catch (err) {

        console.log(err);

        bot.sendMessage(
          msg.chat.id,
          "❌ Song download failed"
        );
      }
    }
  );
};
