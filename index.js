// index.js

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const yts = require("yt-search");

/* =========================
   CONFIG
========================= */

const BOT_TOKEN =
  process.env.BOT_TOKEN || "8314736748:AAEzkKvI-6E2dNFdI2Tad3aWhcUcbNxXulc";

const BASE_API =
  "https://rabbitapi.nett.to";

/* =========================
   BOT
========================= */

const bot = new TelegramBot(
  BOT_TOKEN,
  {
    polling: true
  }
);

console.log("✅ Bot Started");

/* =========================
   START
========================= */

bot.onText(/\/start/, async (msg) => {

  const name =
    msg.from.first_name || "User";

  bot.sendMessage(
    msg.chat.id,

`🎬 Multi Downloader Bot

Hello ${name}

Commands:

/song query

Example:
 /song alan walker

✅ Supported Platforms

• YouTube
• Facebook
• Instagram
• TikTok
• Twitter/X

📥 Just send any video link.

Powered By Rabbit API`
  );
});

/* =========================
   HELP
========================= */

bot.onText(/\/help/, async (msg) => {

  bot.sendMessage(
    msg.chat.id,

`📖 Help Menu

🎵 Song Download:
 /song alan walker

🎬 Video Download:
 Send any supported link

✅ Supported:
• YouTube
• Facebook
• Instagram
• TikTok
• Twitter/X`
  );
});

/* =========================
   SONG COMMAND
========================= */

bot.onText(
  /^\/song (.+)/,
  async (msg, match) => {

    const chatId = msg.chat.id;

    const query = match[1];

    try {

      const wait =
        await bot.sendMessage(
          chatId,
          "🔍 Searching YouTube..."
        );

      /* YT SEARCH */

      const search =
        await yts(query);

      const video =
        search.videos[0];

      if (!video) {

        return bot.editMessageText(
          "❌ Song not found",
          {
            chat_id: chatId,
            message_id: wait.message_id
          }
        );
      }

      const ytUrl = video.url;

      /* API */

      const api =
`${BASE_API}/api/song?url=${encodeURIComponent(ytUrl)}`;

      const { data } =
        await axios.get(api, {
          timeout: 60000
        });

      console.log(data);

      const audio =
        data?.result?.download ||
        data?.result?.url ||
        data?.download ||
        data?.url;

      if (!audio) {

        return bot.editMessageText(
          "❌ Download failed",
          {
            chat_id: chatId,
            message_id: wait.message_id
          }
        );
      }

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      /* THUMBNAIL */

      await bot.sendPhoto(
        chatId,
        video.thumbnail,
        {
          caption:
`🎵 ${video.title}

👤 ${video.author.name}
⏱ ${video.timestamp}
👀 ${video.views.toLocaleString()} Views`
        }
      );

      /* AUDIO */

      await bot.sendAudio(
        chatId,
        audio,
        {
          title: video.title,
          performer:
            video.author.name,

          caption:
`✅ Song Downloaded

🎵 ${video.title}
⏱ ${video.timestamp}`
        }
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        chatId,
        "❌ Song download failed"
      );
    }
  }
);

/* =========================
   PLATFORM DETECT
========================= */

function detectPlatform(
  url = ""
) {

  url = url.toLowerCase();

  if (
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  ) return "youtube";

  if (
    url.includes("facebook.com") ||
    url.includes("fb.watch")
  ) return "facebook";

  if (
    url.includes("instagram.com")
  ) return "instagram";

  if (
    url.includes("tiktok.com")
  ) return "tiktok";

  if (
    url.includes("twitter.com") ||
    url.includes("x.com")
  ) return "twitter";

  return "unknown";
}

/* =========================
   VIDEO HANDLER
========================= */

bot.on(
  "message",
  async (msg) => {

    const chatId =
      msg.chat.id;

    const text =
      msg.text;

    if (!text) return;

    if (
      text.startsWith("/start") ||
      text.startsWith("/help") ||
      text.startsWith("/song")
    ) return;

    if (
      !text.startsWith("http")
    ) {

      return bot.sendMessage(
        chatId,
        "❌ Send a valid video link"
      );
    }

    try {

      const wait =
        await bot.sendMessage(
          chatId,
          "🔍 Processing video..."
        );

      const type =
        detectPlatform(text);

      let endpoint;

      switch (type) {

        case "youtube":

          endpoint =
`/api/play?q=${encodeURIComponent(text)}`;

          break;

        case "facebook":

          endpoint =
`/api/facebook?url=${encodeURIComponent(text)}`;

          break;

        case "instagram":

          endpoint =
`/api/instagram?url=${encodeURIComponent(text)}`;

          break;

        case "tiktok":

          endpoint =
`/api/tiktok?url=${encodeURIComponent(text)}`;

          break;

        case "twitter":

          endpoint =
`/api/twitter?url=${encodeURIComponent(text)}`;

          break;

        default:

          return bot.editMessageText(
            "❌ Unsupported platform",
            {
              chat_id: chatId,
              message_id:
                wait.message_id
            }
          );
      }

      const api =
`${BASE_API}${endpoint}`;

      const { data } =
        await axios.get(api, {
          timeout: 60000
        });

      console.log(data);

      const video =
        data?.response?.downloadLink ||
        data?.response?.video ||
        data?.result?.video ||
        data?.result?.url ||
        data?.video ||
        data?.url;

      const title =
        data?.response?.title ||
        data?.result?.title ||
        data?.title ||
        "Unknown";

      const thumbnail =
        data?.response?.thumbnail ||
        data?.result?.thumbnail ||
        data?.thumbnail;

      const duration =
        data?.response?.duration ||
        data?.result?.duration ||
        data?.duration ||
        "Unknown";

      if (!video) {

        return bot.editMessageText(
          "❌ Video not found",
          {
            chat_id: chatId,
            message_id:
              wait.message_id
          }
        );
      }

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      if (thumbnail) {

        await bot.sendPhoto(
          chatId,
          thumbnail,
          {
            caption:
`🎬 ${title}

🌐 Platform: ${type}
⏱ ${duration}`
          }
        );
      }

      await bot.sendVideo(
        chatId,
        video,
        {
          caption:
`✅ Download Complete

🎬 ${title}
🌐 ${type}
⏱ ${duration}`,

          supports_streaming: true
        }
      );

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        chatId,
        "❌ Download failed"
      );
    }
  }
);

/* =========================
   ERRORS
========================= */

process.on(
  "unhandledRejection",
  console.error
);

process.on(
  "uncaughtException",
  console.error
);
