// plugins/url.js

const axios = require("axios");
const FormData = require("form-data");

module.exports = (bot) => {

  bot.onText(/^\/url$/, async (msg) => {

    try {

      const chatId = msg.chat.id;

      /* CHECK REPLY */

      if (!msg.reply_to_message) {

        return bot.sendMessage(
          chatId,
          "❌ Reply to a file"
        );
      }

      const reply =
        msg.reply_to_message;

      /* GET FILE ID */

      const fileId =
        reply.document?.file_id ||
        reply.photo?.pop()?.file_id ||
        reply.video?.file_id ||
        reply.audio?.file_id ||
        reply.voice?.file_id;

      if (!fileId) {

        return bot.sendMessage(
          chatId,
          "❌ Unsupported file"
        );
      }

      /* WAIT MESSAGE */

      const wait =
        await bot.sendMessage(
          chatId,
          "📤 Uploading file..."
        );

      /* GET FILE PATH */

      const file =
        await bot.getFile(fileId);

      const telegramFile =
`https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

      console.log(
        "Telegram File:",
        telegramFile
      );

      /* DOWNLOAD FILE */

      const response =
        await axios({
          url: telegramFile,
          method: "GET",
          responseType: "stream"
        });

      /* CREATE FORM */

      const form =
        new FormData();

      form.append(
        "file",
        response.data,
        "upload"
      );

      /* UPLOAD TO CDN */

      const { data } =
        await axios.post(
          "https://rabbitapi.nett.to/cdn/upload",
          form,
          {
            headers:
              form.getHeaders(),

            maxBodyLength:
              Infinity
          }
        );

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      /* DELETE WAIT */

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      /* GET CDN URL */

      const url =
        data?.result?.cdn;

      if (!url) {

        return bot.sendMessage(
          chatId,
          "❌ Upload failed"
        );
      }

      /* SEND URL */

      await bot.sendMessage(
        chatId,
        url
      );

    } catch (err) {

      console.log(
        "Upload Error:",
        err.response?.data ||
        err.message
      );

      bot.sendMessage(
        msg.chat.id,
        "❌ Upload failed"
      );
    }
  });
};
