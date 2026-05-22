// plugins/start.js

module.exports = (bot) => {

  bot.onText(
    /\/start/,

    async (msg) => {

      await bot.sendMessage(
        msg.chat.id,

`🎬 Multi Downloader Bot

✅ Supported:
• Facebook
• Instagram
• Spotify

🎵 Commands:
/song tere liye,
/song alan walker`
      );
    }
  );
};
