// plugins/facebook.js

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
            "facebook.com"
          ) &&
          !text.includes(
            "fb.watch"
          )
        ) return;

        const chatId =
          msg.chat.id;

        const wait =
          await bot.sendMessage(
            chatId,
            "🔍 Downloading Facebook..."
          );

        const {
          data
        } = await api.get(

`https://rabbitapi.nett.to/api/fb?url=${encodeURIComponent(text)}`
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

        /* TRY HD */

        if (hd) {

          try {

            console.log(
              "📥 Sending HD..."
            );

            return await bot.sendVideo(
              chatId,
              hd,
              {
                caption:
                  title,

                supports_streaming: true
              }
            );

          } catch (err) {

            console.log(
              "❌ HD Failed"
            );
          }
        }

        /* TRY SD */

        if (sd) {

          try {

            console.log(
              "📥 Sending SD..."
            );

            return await bot.sendVideo(
              chatId,
              sd,
              {
                caption:
                  title,

                supports_streaming: true
              }
            );

          } catch (err) {

            console.log(
              "❌ SD Failed -> Document"
            );

            return await bot.sendDocument(
              chatId,
              sd,
              {
                caption:
                  title
              }
            );
          }
        }

        return bot.sendMessage(
          chatId,
          "❌ Video not found"
        );

      } catch (err) {

        console.log(err);

        bot.sendMessage(
          msg.chat.id,
          "❌ Facebook failed"
        );
      }
    }
  );
};
