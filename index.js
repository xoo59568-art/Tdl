// index.js

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const yts = require("yt-search");

const BOT_TOKEN =
  process.env.BOT_TOKEN || "YOUR_BOT_TOKEN";

const BASE_API =
  "https://rabbitapi.nett.to";

/* =========================
   AXIOS
========================= */

const api = axios.create({
  timeout: 120000, // 2 minutes
  headers: {
    "User-Agent":
      "Mozilla/5.0"
  }
});

/* =========================
   BOT
========================= */

const bot = new TelegramBot(
  BOT_TOKEN,
  {
    polling: true
  }
);

console.log("✅ Bot Running");

/* =========================
   START
========================= */

bot.onText(/\/start/, async (msg) => {

  bot.sendMessage(
    msg.chat.id,

`🎬 Multi Downloader Bot

Commands:

/song query

Example:
 /song alan walker

✅ Supported:
• Facebook
• Instagram
• Spotify`
  );
});

/* =========================
   DETECT PLATFORM
========================= */

function detectPlatform(url = "") {

  url = url.toLowerCase();

  if (
    url.includes("facebook.com") ||
    url.includes("fb.watch")
  ) return "fb";

  if (
    url.includes("instagram.com")
  ) return "insta";

  if (
    url.includes("spotify.com")
  ) return "spotify";

  return "unknown";
}

/* =========================
   SMART EXTRACTOR
========================= */

function extractResponse(data) {

  const video =

    data?.hd ||
    data?.HD ||

    data?.sd ||
    data?.SD ||

    data?.video ||
    data?.url ||
    data?.download ||

    data?.result?.hd ||
    data?.result?.HD ||

    data?.result?.sd ||
    data?.result?.SD ||

    data?.result?.video ||
    data?.result?.url ||

    data?.response?.video ||
    data?.response?.downloadLink ||

    null;

  const audio =

    data?.mp3 ||
    data?.audio ||
    data?.music ||
    data?.song ||

    data?.result?.mp3 ||
    data?.result?.audio ||
    data?.result?.music ||

    null;

  return {

    video,
    audio,

    title:

      data?.title ||
      data?.result?.title ||
      data?.response?.title ||
      "Media",

    thumbnail:

      data?.thumbnail ||
      data?.thumb ||
      data?.image ||
      data?.cover ||
      data?.poster ||

      data?.result?.thumbnail ||
      data?.result?.thumb ||
      data?.result?.image ||

      null,

    caption:

      data?.caption ||
      data?.description ||

      data?.result?.caption ||
      data?.result?.description ||

      "",

    duration:

      data?.duration ||
      data?.result?.duration ||
      null
  };
}

/* =========================
   SAFE VIDEO SEND
========================= */

async function sendVideoSafe(
  chatId,
  url,
  caption = ""
) {

  try {

    return await bot.sendVideo(
      chatId,
      url,
      {
        caption,
        supports_streaming: true
      }
    );

  } catch (err) {

    console.log(
      "Video failed -> Document"
    );

    return await bot.sendDocument(
      chatId,
      url,
      {
        caption
      }
    );
  }
}

/* =========================
   SAFE AUDIO SEND
========================= */

async function sendAudioSafe(
  chatId,
  url,
  title = "Audio",
  caption = ""
) {

  try {

    return await bot.sendAudio(
      chatId,
      url,
      {
        title,
        caption
      }
    );

  } catch (err) {

    console.log(
      "Audio failed -> Document"
    );

    return await bot.sendDocument(
      chatId,
      url,
      {
        caption
      }
    );
  }
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
          "🔍 Searching..."
        );

      /* YT SEARCH */

      const search =
        await yts(query);

      const first =
        search.videos[0];

      if (!first) {

        return bot.editMessageText(
          "❌ Song not found",
          {
            chat_id: chatId,
            message_id:
              wait.message_id
          }
        );
      }

      /* API */

      const url =
`${BASE_API}/api/Song?url=${encodeURIComponent(first.url)}`;

      const { data } =
        await api.get(url);

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      const response =
        extractResponse(data);

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

              `🎵 ${response.title}`
          }
        );
      }

      /* AUDIO */

      if (
        response.audio
      ) {

        await sendAudioSafe(
          chatId,
          response.audio,
          response.title,
          response.caption
        );
      }

    } catch (err) {

      console.log(err);

      bot.sendMessage(
        chatId,
        "❌ Song failed"
      );
    }
  }
);

/* =========================
   MAIN LINK HANDLER
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
      text.startsWith("/song")
    ) return;

    if (
      !text.startsWith("http")
    ) {

      return bot.sendMessage(
        chatId,
        "❌ Send valid link"
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

        case "fb":

          endpoint =
`/api/fb?url=${encodeURIComponent(text)}`;

          break;

        case "insta":

          endpoint =
`/api/insta?url=${encodeURIComponent(text)}`;

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

      const url =
`${BASE_API}${endpoint}`;

      const { data } =
        await api.get(url);

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      const response =
        extractResponse(data);

      await bot.deleteMessage(
        chatId,
        wait.message_id
      );

      /* THUMBNAIL */

      if (
        response.thumbnail
      ) {

        await bot.sendPhoto(
          chatId,
          response.thumbnail,
          {
            caption:
              response.caption ||
              response.title
          }
        );
      }

      /* VIDEO */

      if (
        response.video
      ) {

        await sendVideoSafe(
          chatId,
          response.video,
          response.caption
        );
      }

      /* AUDIO */

      if (
        response.audio
      ) {

        await sendAudioSafe(
          chatId,
          response.audio,
          response.title,
          response.caption
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
