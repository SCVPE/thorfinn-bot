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
   BOT READY
========================= */
client.once("ready", () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

/* =========================
   COMMANDES PREFIX
========================= */
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  /* ===== PING ===== */
  if (command === "ping") {
    message.reply("🏓 Pong !");
  }

  /* ===== SAY ===== */
  if (command === "say") {
    if (!args.length) {
      return message.reply("❌ Tu dois écrire un message.");
    }
    message.channel.send(args.join(" "));
  }

  /* ===== INFO ===== */
  if (command === "info") {
    message.reply(
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
