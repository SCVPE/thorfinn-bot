// Charge les variables d'environnement (.env)
require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

// Création du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // nécessite l'option activée sur le portail Discord
  ],
});

// Quand le bot est prêt
client.once("ready", () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// Quand un message est envoyé
client.on("messageCreate", (message) => {
  // Ignore les messages des bots
  if (message.author.bot) return;

  if (message.content === "!ping") {
    message.reply("🏓 Pong !");
  }
});

// Connexion du bot avec le token
client.login(process.env.TOKEN);
