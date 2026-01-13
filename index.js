// Charge les variables d'environnement (.env)
require("dotenv").config();

const { Client, GatewayIntentBits, Events } = require("discord.js");

// Préfixe des commandes
const PREFIX = "+";

// Création du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // nécessaire et déjà activé chez toi
  ],
});

// ✅ ÉVÉNEMENT CORRIGÉ (plus de DeprecationWarning)
client.once(Events.ClientReady, () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

// Quand un message est envoyé
client.on(Events.MessageCreate, (message) => {
  // Ignore les messages des bots
  if (message.author.bot) return;

  // Commande +ping
  if (message.content === `${PREFIX}ping`) {
    message.reply("🏓 Pong !");
  }
});

// Connexion du bot avec le token
client.login(process.env.DISCORD_TOKEN);
