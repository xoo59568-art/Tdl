// plugins/instagram.js

const axios =
  require("axios");

const api =
  axios.create({

    timeout: 180000,

    headers: {
      "User-Agent":
        "Mozilla/5.0"
    }
  });

module.exports = (bot) => {

  bot.on(
    "message",

    async (msg) => {

      try {

        const text =
          msg.text;

        if (!text)
          return;

        if (
          text.startsWith(
            "/"
          )
        ) return;

        if (
          !text.includes(
            "instagram.com"
          )
        ) return;

        const chatId =
          msg.chat.id;

        const wait =
          await bot.sendMessage(
            chatId,
            "🔍 Downloading Instagram..."
          );

        const {
          data
        } = await api.get(

`https://rabbitapi.nett.to/api/insta?url=${encodeURIComponent(text)}`
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

        const media =

          data?.result?.url ||
          data?.url;

        const title =

          data?.result?.title ||
          data?.title ||
          "Instagram Media";

        const thumbnail =

          data?.result?.thumbnail ||
          data?.thumbnail;

        if (!media) {

          return bot.sendMessage(
            chatId,
            "❌ Media not found"
          );
        }

        /* THUMB */

        if (thumbnail) {

          try {

            await bot.sendPhoto(
              chatId,
              thumbnail,
              {
                caption:
                  title
              }
            );

          } catch {}
        }

        /* VIDEO */

        if (
          media.includes(
            ".mp4"
          )
        ) {

          try {

            return await bot.sendVideo(
              chatId,
              media,
              {
                caption:
                  title,

                supports_streaming: true
              }
            );

          } catch {

            return await bot.sendDocument(
              chatId,
              media,
              {
                caption:
                  title
              }
            );
          }
        }

        /* IMAGE */

        return await bot.sendPhoto(
          chatId,
          media,
          {
            caption:
              title
          }
        );

      } catch (err) {

        console.log(err);

        bot.sendMessage(
          msg.chat.id,
          "❌ Instagram failed"
        );
      }
    }
  );
};
