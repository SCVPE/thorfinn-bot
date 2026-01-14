require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

/* =========================
   EXPRESS (OBLIGATOIRE POUR RENDER)
========================= */
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Bot Discord en ligne 🚀");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

/* =========================
   DISCORD CLIENT
========================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = "+";

/* =========================
   ROTATION DES STATUTS
========================= */
const activities = [
  "scape qui Flip reset",
  "scape qui live",
  "scape qui dort",
  "scape qui fait des bruits de clavier",
  "si tout vas bien dans le serveur",
  "si il a des ennemis",
  "si son père est revenu"
];

let activityIndex = 0;

function setBotPresence() {
  client.user.setPresence({
    status: "idle", // 🟡 lune jaune
    activities: [
      {
        name: activities[activityIndex],
        type: 3 // 👀 WATCHING
      }
    ]
  });

  activityIndex = (activityIndex + 1) % activities.length;
}

/* =========================
   BOT READY
========================= */
client.once("ready", () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);

  // Présence initiale
  setBotPresence();

  // 🔁 Rotation + refresh toutes les 60 secondes
  setInterval(() => {
    setBotPresence();
    console.log("🔄 Présence Discord mise à jour");
  }, 60_000);
});

/* =========================
   COMMANDES PREFIX
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  /* ===== PING ===== */
  if (command === "ping") {
    return message.reply("🏓 Pong !");
  }

  /* ===== SAY ===== */
  if (command === "say") {
    if (!args.length) {
      return message.reply("❌ Tu dois écrire un message.");
    }
    await message.channel.send(args.join(" "));
    return message.delete();
  }

  /* ===== INFO ===== */
  if (command === "info") {
    return message.reply(
      `👋 Salut !
Prefix : \`${PREFIX}\`
Commandes disponibles :
• ${PREFIX}ping
• ${PREFIX}say <message>
• ${PREFIX}info`
    );
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.DISCORD_TOKEN);
