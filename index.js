require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const cron = require("node-cron");

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
    GatewayIntentBits.GuildMembers
  ]
});

const PREFIX = "+";
const WELCOME_CHANNEL_ID = "1460324412124434546";
const STAR_ROLE_ID = "1463698623043735612";
const GENERAL_CHANNEL_ID = "1460277724063994210";

/* =========================
   COMPTEUR DE MESSAGES (JOURNALIER)
========================= */
let messageCounts = {};

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
    status: "idle",
    activities: [
      {
        name: activities[activityIndex],
        type: 3
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
  setInterval(setBotPresence, 60_000);

  console.log("⏰ Star du jour programmée à 00h00");
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
   COMPTER LES MESSAGES
========================= */
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) return;

  const userId = message.author.id;
  messageCounts[userId] = (messageCounts[userId] || 0) + 1;
});

/* =========================
   STAR DU JOUR (00H00)
========================= */
cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      const guild = client.guilds.cache.first();
      if (!guild) return;

      const starRole = guild.roles.cache.get(STAR_ROLE_ID);
      const generalChannel = guild.channels.cache.get(GENERAL_CHANNEL_ID);

      if (!starRole || !generalChannel) return;

      const topUserId = Object.keys(messageCounts).reduce(
        (a, b) => (messageCounts[a] > messageCounts[b] ? a : b),
        null
      );

      if (!topUserId) return;

      const member = await guild.members.fetch(topUserId);

      // Retirer le rôle à l'ancien gagnant
      for (const m of starRole.members.values()) {
        await m.roles.remove(starRole);
      }

      // Donner le rôle au nouveau
      await member.roles.add(starRole);

      // Message d'annonce
      await generalChannel.send(
        `🎉 **BRAVO ${member} !** 🎉

C'est toi qui as envoyé le plus de messages aujourd'hui 💬🔥  
Tu es donc la **⭐ STAR DU JOUR ⭐**

Profite bien de tes **24h**, car demain… tout recommence 👀`
      );

      console.log(`⭐ Star du jour : ${member.user.tag}`);

      // Reset des stats
      messageCounts = {};
    } catch (error) {
      console.error("❌ Erreur Star du jour :", error);
    }
  },
  {
    timezone: "Europe/Paris"
  }
);

/* =========================
   COMMANDES PREFIX
========================= */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const COMMANDS_CHANNEL_ID = "1463652925401465015";

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (["top", "mystats", "star", "help"].includes(command)) {
    const commandsChannel = message.guild.channels.cache.get(COMMANDS_CHANNEL_ID);

    if (!commandsChannel || !commandsChannel.isTextBased()) {
      return message.reply("❌ Le salon commandes est introuvable ou non textuel. Vérifie l’ID du salon.");
    }

    const botPerms = commandsChannel.permissionsFor(message.guild.members.me);
    if (!botPerms || !botPerms.has("SendMessages")) {
      return message.reply("❌ Je n’ai pas la permission d’écrire dans le salon commandes.");
    }

    // +help
    if (command === "help") {
      return commandsChannel.send(
        `📖 **COMMANDES DU BOT** 📖

👤 **Membres**
• ${PREFIX}star → voir la star actuelle
• ${PREFIX}top → classement du jour
• ${PREFIX}mystats → tes stats du jour
• ${PREFIX}help → afficher cette aide

👑 **Admins**
• ${PREFIX}teststar
• ${PREFIX}resetstar
• ${PREFIX}forcestar`
      );
    }

    const sorted = Object.entries(messageCounts).sort((a, b) => b[1] - a[1]);

    // +star
    if (command === "star") {
      if (!sorted.length) {
        return commandsChannel.send("⭐ Aucune star pour le moment.");
      }
      const member = await message.guild.members.fetch(sorted[0][0]);
      return commandsChannel.send(
        `⭐ **Star actuelle du jour** : ${member} — ${sorted[0][1]} messages`
      );
    }

    // +top
    if (command === "top") {
      if (!sorted.length) {
        return commandsChannel.send("🏆 Aucun message aujourd’hui.");
      }

      const top = sorted.slice(0, 5);
      let text = "🏆 **TOP 5 DU JOUR** 🏆\n\n";

      for (let i = 0; i < top.length; i++) {
        const m = await message.guild.members.fetch(top[i][0]);
        text += `${i + 1}️⃣ ${m} — ${top[i][1]} messages\n`;
      }

      return commandsChannel.send(text);
    }

    // +mystats
    if (command === "mystats") {
      const count = messageCounts[message.author.id] || 0;
      const position =
        sorted.findIndex(([id]) => id === message.author.id) + 1 || "—";

      return commandsChannel.send(
        `📊 **Tes stats aujourd’hui**\n💬 Messages : ${count}\n🏅 Position : ${position}`
      );
    }
  }

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
      `⭐ **SYSTÈME STAR DU JOUR** ⭐

Chaque jour, le bot analyse l’activité du serveur 💬

👉 Le membre qui envoie **le plus de messages entre 00h et 23h59 (heure FR)** devient la **⭐ Star du jour ⭐**.

🎉 À 00h :
• le rôle **Star du jour** est attribué
• un message d’annonce est envoyé
• les compteurs sont remis à zéro

📊 **Commandes utiles**
• ${PREFIX}star → voir la star actuelle
• ${PREFIX}top → classement du jour
• ${PREFIX}mystats → tes stats personnelles
• ${PREFIX}help → toutes les commandes

🔥 Parle, participe… et deviens la star !`
    );
  }

  if (command === "teststar") {
    if (!message.member || !message.member.permissions.has("Administrator")) {
      return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
    }

    const guild = message.guild;
    const starRole = guild.roles.cache.get(STAR_ROLE_ID);
    const generalChannel = guild.channels.cache.get(GENERAL_CHANNEL_ID);

    if (!starRole || !generalChannel) {
      return message.reply("❌ Rôle ou salon introuvable.");
    }

    const topUserId = Object.keys(messageCounts).reduce(
      (a, b) => (messageCounts[a] > messageCounts[b] ? a : b),
      null
    );

    if (!topUserId) {
      return message.reply("❌ Aucun message comptabilisé aujourd’hui.");
    }

    const member = await guild.members.fetch(topUserId);

    for (const m of starRole.members.values()) {
      await m.roles.remove(starRole);
    }

    await member.roles.add(starRole);

    await generalChannel.send(
      `🧪 **TEST STAR DU JOUR** 🧪

${member} serait la **⭐ star du jour ⭐** si on était à minuit 👀`
    );

    return message.reply("✅ Test effectué avec succès.");
  }

  if (command === "resetstar") {
    if (!message.member || !message.member.permissions.has("Administrator")) {
      return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
    }

    const guild = message.guild;
    const starRole = guild.roles.cache.get(STAR_ROLE_ID);
    const generalChannel = guild.channels.cache.get(GENERAL_CHANNEL_ID);

    if (!starRole || !generalChannel) {
      return message.reply("❌ Rôle ou salon introuvable.");
    }

    const topUserId = Object.keys(messageCounts).reduce(
      (a, b) => (messageCounts[a] > messageCounts[b] ? a : b),
      null
    );

    if (!topUserId) {
      return message.reply("❌ Aucun message comptabilisé pour le moment.");
    }

    const member = await guild.members.fetch(topUserId);

    // Retirer le rôle à tous
    for (const m of starRole.members.values()) {
      await m.roles.remove(starRole);
    }

    // Donner le rôle au nouveau gagnant
    await member.roles.add(starRole);

    // Reset des stats après reset manuel
    messageCounts = {};

    await generalChannel.send(
      `🔄 **RESET STAR DU JOUR** 🔄

La star du jour a été réinitialisée manuellement.
⭐ **Nouvelle star : ${member}** ⭐

Le compteur repart de zéro 🔥`
    );

    return message.reply("✅ Star du jour réinitialisée avec succès.");
  }

  if (command === "forcestar") {
    if (!message.member || !message.member.permissions.has("Administrator")) {
      return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
    }

    const guild = message.guild;
    const starRole = guild.roles.cache.get(STAR_ROLE_ID);
    const generalChannel = guild.channels.cache.get(GENERAL_CHANNEL_ID);

    if (!starRole || !generalChannel) {
      return message.reply("❌ Rôle ou salon introuvable.");
    }

    const topUserId = Object.keys(messageCounts).reduce(
      (a, b) => (messageCounts[a] > messageCounts[b] ? a : b),
      null
    );

    if (!topUserId) {
      return message.reply("❌ Aucun message comptabilisé depuis 00h.");
    }

    const member = await guild.members.fetch(topUserId);

    // Retirer le rôle à tous les autres
    for (const m of starRole.members.values()) {
      await m.roles.remove(starRole);
    }

    // Donner le rôle au leader actuel
    await member.roles.add(starRole);

    await generalChannel.send(
      `⭐ **STAR DU JOUR (ACTUELLE)** ⭐

Pour l'instant, depuis **00h**, la personne la plus active est :
👉 ${member} 💬🔥

La journée n'est pas finie 👀`
    );

    return message.reply("✅ Star du jour actuelle attribuée.");
  }
});

/* =========================
   LOGIN
========================= */
client.login(process.env.DISCORD_TOKEN);