import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

import fs from "fs";
import { client } from "./bot.js";
import { ENV } from "../config/env.js";
import { createTicket } from "./tickets.js";

const APP_FILE = "./database/applications.json";

function readApps() {
  return JSON.parse(fs.readFileSync(APP_FILE, "utf-8"));
}

function writeApps(apps) {
  fs.writeFileSync(APP_FILE, JSON.stringify(apps, null, 2));
}

export async function sendPartnershipApplication(data) {
  const channel = await client.channels.fetch(
    ENV.PARTNERSHIP_CHANNEL_ID
  );

  const appId = Date.now().toString();

  const application = {
    id: appId,
    status: "pending",
    history: ["Application Created"],
    createdAt: new Date().toISOString(),
    ...data,
  };

  const apps = readApps();
  apps.push(application);
  writeApps(apps);

  const embed = new EmbedBuilder()
    .setTitle("🤝 Partnership Application")
    .setColor("#5865F2")
    .addFields(
      { name: "👤 Name", value: data.name || "Unknown" },
      { name: "📧 Email", value: data.email || "Unknown" },
      { name: "💬 Discord", value: data.discord || "Unknown" },
      { name: "🌐 Server", value: data.server || "Unknown" },
      { name: "👥 Members", value: data.members || "Unknown" },
      { name: "📝 Reason", value: data.reason || "None" },
      { name: "📨 Message", value: data.message || "None" }
    )
    .setFooter({ text: `Application ID: ${appId}` })
    .setTimestamp();

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`accept_${appId}`)
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`deny_${appId}`)
      .setLabel("Deny")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`ticket_${appId}`)
      .setLabel("Open Ticket")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`history_${appId}`)
      .setLabel("History")
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({ embeds: [embed], components: [buttons] });

  return { success: true, id: appId };
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, appId] = interaction.customId.split("_");
  const apps = readApps();

  const app = apps.find((a) => a.id === appId);

  if (!app) {
    return interaction.reply({
      content: "❌ Application not found",
      ephemeral: true,
    });
  }

  if (action === "accept") {
    app.status = "accepted";
    app.history.push(`✅ Accepted by ${interaction.user.tag}`);
  }

  if (action === "deny") {
    app.status = "denied";
    app.history.push(`❌ Denied by ${interaction.user.tag}`);
  }

  if (action === "ticket") {
    const ticket = await createTicket(app);
    app.history.push(`🎫 Ticket opened by ${interaction.user.tag}`);

    writeApps(apps);

    return interaction.reply({
      content: `🎫 Ticket created: ${ticket}`,
      ephemeral: true,
    });
  }

  if (action === "history") {
    return interaction.reply({
      content: app.history.join("\n"),
      ephemeral: true,
    });
  }

  writeApps(apps);

  return interaction.reply({
    content: `✅ Updated: ${app.status}`,
    ephemeral: true,
  });
});