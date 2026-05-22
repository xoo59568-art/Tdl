// index.js

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const yts = require("yt-search");

/* =========================
   CONFIG
========================= */

const BOT_TOKEN =
  process.env.BOT_TOKEN || "YOUR_BOT_TOKEN";

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

• Instagram
• Facebook
• Spotify

📥 Just send any link.

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
• Instagram
• Facebook
• Spotify`
  );
});

/* =========================
   PLATFORM DETECT
========================= */

function detectPlatform(url = "") {

  url = url.toLowerCase();

  if (
    url.includes("instagram.com")
  ) return "insta";

  if (
    url.includes("facebook.com") ||
    url.includes("fb.watch")
  ) return "fb";

  if (
    url.includes("spotify.com")
  ) return "spotify";

  return "unknown";
}

/* =========================
   RESPONSE EXTRACTOR
========================= */

function extractResponse(type, data) {

  return {

    /* =========================
       VIDEO PRIORITY
       HD → SD → VIDEO → URL
    ========================= */

    video:

      data?.hd ||

      data?.HD ||

      data?.result?.hd ||

      data?.result?.HD ||

      data?.sd ||

      data?.SD ||

      data?.result?.sd ||

      data?.result?.SD ||

      data?.video ||

      data?.result?.video ||

      data?.response?.video ||

      data?.response?.downloadLink ||

      data?.url ||

      data?.result?.url ||

      null,

    /* =========================
       AUDIO / MP3
    ========================= */

    audio:

      data?.mp3 ||

      data?.audio ||

      data?.music ||

      data?.download ||

      data?.result?.mp3 ||

      data?.result?.audio ||

      data?.result?.music ||

      data?.result?.download ||

      null,

    /* =========================
       TITLE
    ========================= */

    title:

      data?.title ||

      data?.result?.title ||

      data?.response?.title ||

      null,

    /* =========================
       THUMBNAIL
    ========================= */

    thumbnail:

      data?.thumbnail ||

      data?.thumb ||

      data?.image ||

      data?.cover ||

      data?.poster ||

      data?.result?.thumbnail ||

      data?.result?.thumb ||

      data?.result?.image ||

      data?.result?.cover ||

      null,

    /* =========================
       CAPTION
    ========================= */

    caption:

      data?.caption ||

      data?.result?.caption ||

      data?.description ||

      data?.result?.description ||

      null,

    /* =========================
       DURATION
    ========================= */

    duration:

      data?.duration ||

      data?.result?.duration ||

      null
  };
}

/* =========================
   SONG COMMAND
========================= */

bot.onText(
  /^\/song (.+)/,
  async (msg, match) => {

    const chatId =
      msg.chat.id;

    const query =
      match[1];

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
            message_id:
              wait.message_id
          }
        );
      }

      const ytUrl =
        video.url;

      /* API */

      const api =
`${BASE_API}/api/Spotify?url=${encodeURIComponent(ytUrl)}`;

      const { data } =
        await axios.get(api);

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      const response =
        extractResponse(
          "spotify",
          data
        );

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      /* THUMB */

      if (
        response.thumbnail
      ) {

        await bot.sendPhoto(
          chatId,
          response.thumbnail,
          {
            caption:
              response.caption ||

              `🎵 ${response.title || video.title}`
          }
        );
      }

      /* AUDIO */

      if (
        response.audio
      ) {

        return await bot.sendAudio(
          chatId,
          response.audio,
          {
            title:
              response.title ||
              video.title,

            performer:
              video.author.name,

            caption:
              response.caption || ""
          }
        );
      }

      bot.sendMessage(
        chatId,
        "❌ Audio not found"
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
   LINK HANDLER
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
        "❌ Send a valid link"
      );
    }

    try {

      const wait =
        await bot.sendMessage(
          chatId,
          "🔍 Processing..."
        );

      const type =
        detectPlatform(text);

      let endpoint;

      switch (type) {

        case "insta":

          endpoint =
`/api/insta?url=${encodeURIComponent(text)}`;

          break;

        case "fb":

          endpoint =
`/api/fb?url=${encodeURIComponent(text)}`;

          break;

        case "spotify":

          endpoint =
`/api/Spotify?url=${encodeURIComponent(text)}`;

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
        await axios.get(api);

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      const response =
        extractResponse(
          type,
          data
        );

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      /* THUMB */

      if (
        response.thumbnail
      ) {

        await bot.sendPhoto(
          chatId,
          response.thumbnail,
          {
            caption:
              response.caption ||

              `🎬 ${response.title || "Media"}`
          }
        );
      }

      /* VIDEO */

      if (
        response.video
      ) {

        await bot.sendVideo(
          chatId,
          response.video,
          {
            caption:
              response.caption || "",

            supports_streaming: true
          }
        );
      }

      /* AUDIO */

      if (
        response.audio
      ) {

        await bot.sendAudio(
          chatId,
          response.audio,
          {
            title:
              response.title ||
              "Audio",

            caption:
              response.caption || ""
          }
        );
      }

      if (
        !response.video &&
        !response.audio
      ) {

        bot.sendMessage(
          chatId,
          "❌ Media not found"
        );
      }

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
