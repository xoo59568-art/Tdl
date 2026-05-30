import axios from "axios";
import { Module } from "../lib/plugins.js";

Module({
  command: "insta",
  package: "downloader",
  description: "Instagram Downloader",
})(async (message, match) => {
  if (!match) {
    return message.send("_need instagram url_");
  }

  try {
    await message.react("🔍");

    const { data } = await axios.get(
      `https://your-api-url.com/api/instagram?url=${encodeURIComponent(match)}`,
      {
        timeout: 60000,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!data?.status || !data?.url) {
      throw new Error("No media found");
    }

    await message.react("⬇️");

    await message.conn.sendMessage(
      message.from,
      {
        video: {
          url: data.url,
        },
        caption: "✅ Instagram Downloaded",
      },
      {
        quoted: message.raw,
      }
    );

    await message.react("✅");
  } catch (e) {
    console.error("INSTA ERROR:", e);

    await message.react("❌");
    await message.send("❌ Instagram download failed");
  }
});
