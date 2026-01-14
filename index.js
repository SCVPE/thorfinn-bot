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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // 👈 OBLIGATOIRE pour les joins
  ]
});

const PREFIX = "+";
const WELCOME_CHANNEL_ID = "1460324412124434546"; // 🔴 À REMPLACER

/* =========================
   ROTATION DES STATUTS
========================= */
const activities = [
  "scape qui flip reset",
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
    status: "idle", // 🟡 inactif
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

  setBotPresence();

  setInterval(() => {
    setBotPresence();
    console.log("🔄 Présence Discord mise à jour");
  }, 60_000);
});

/* =========================
   MESSAGE DE BIENVENUE
========================= */
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    await channel.send(
      `Bienvenu ${member} ! Tu viens d'arriver dans **${member.guild.name}**, j'espère que tu passera un bon séjour !`
    );
  } catch (error) {
    console.error("❌ Erreur message de bienvenue :", error);
  }
});

/* =========================
   COMMANDES PREFIX
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    return message.reply("🏓 Pong !");
  }

  if (command === "say") {
    if (!args.length) {
      return message.reply("❌ Tu dois écrire un message.");
    }
    await message.channel.send(args.join(" "));
    return message.delete();
  }

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
