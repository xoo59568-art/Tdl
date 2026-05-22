const fs = require("fs");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

/* =========================
   BOT TOKEN
========================= */

const BOT_TOKEN =
  "8314736748:AAEzkKvI-6E2dNFdI2Tad3aWhcUcbNxXulc";

/* =========================
   BOT
========================= */

const bot =
  new TelegramBot(
    BOT_TOKEN,
    {
      polling: {
        autoStart: true,
        interval: 1000,
        params: {
          timeout: 10
        }
      }
    }
  );

console.log("✅ Bot Running");

/* =========================
   LOAD PLUGINS
========================= */

const pluginsPath =
  path.join(
    __dirname,
    "plugins"
  );

const files =
  fs.readdirSync(
    pluginsPath
  );

for (const file of files) {

  if (
    !file.endsWith(".js")
  ) continue;

  try {

    const plugin =
      require(
        `./plugins/${file}`
      );

    if (
      typeof plugin ===
      "function"
    ) {

      plugin(bot);

      console.log(
`✅ Loaded Plugin -> ${file}`
      );
    }

  } catch (err) {

    console.log(
`❌ Failed Plugin -> ${file}`
    );

    console.log(err);
  }
}

/* =========================
   ERRORS
========================= */

process.on(
  "unhandledRejection",

  (err) => {

    console.log(
      "Unhandled Rejection:"
    );

    console.log(err);
  }
);

process.on(
  "uncaughtException",

  (err) => {

    console.log(
      "Uncaught Exception:"
    );

    console.log(err);
  }
);
