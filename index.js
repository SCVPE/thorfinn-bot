// =======================
// ENV
// =======================
require("dotenv").config();

// =======================
// EXPRESS (POUR RENDER)
// =======================
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot Discord is running ✅");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// =======================
// DISCORD BOT
// =======================
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const PREFIX = "+";

client.once("clientReady", () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    return message.reply("🏓 Pong !");
  }

  if (command === "help") {
    return message.reply(
`📜 **Commandes**
+ping
+help
+say <texte>
+clear <nombre>
+userinfo
+serverinfo
+avatar
+botinfo`
    );
  }

  if (command === "say") {
    if (!args.length) return message.reply("❌ Message manquant.");
    message.delete().catch(() => {});
    return message.channel.send(args.join(" "));
  }

  if (command === "clear") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Permission requise : Gérer les messages.");
    }

    const amount = parseInt(args[0]) || 10;
    if (amount < 1 || amount > 100) {
      return message.reply("❌ Entre 1 et 100.");
    }

    await message.channel.bulkDelete(amount, true);
    const msg = await message.channel.send(`🧹 ${amount} messages supprimés`);
    setTimeout(() => msg.delete(), 3000);
  }

  if (command === "userinfo") {
    const user = message.author;
    return message.reply(
`👤 ${user.tag}
ID: ${user.id}
Créé: <t:${Math.floor(user.createdTimestamp / 1000)}:R>`
    );
  }

  if (command === "serverinfo") {
    const guild = message.guild;
    return message.reply(
`🏠 ${guild.name}
Membres: ${guild.memberCount}
Créé: <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`
    );
  }

  if (command === "avatar") {
    return message.reply(message.author.displayAvatarURL({ size: 512 }));
  }

  if (command === "botinfo") {
    return message.reply(
`🤖 ${client.user.tag}
Serveurs: ${client.guilds.cache.size}
Préfix: +`
    );
  }
});

client.login(process.env.TOKEN);
