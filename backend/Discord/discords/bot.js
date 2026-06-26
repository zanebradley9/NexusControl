import { Client, GatewayIntentBits } from "discord.js";
import { ENV } from "../config/env.js";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("clientReady", () => {
  console.log(`✅ Discord Bot Online: ${client.user.tag}`);
});

client.login(ENV.DISCORD_TOKEN);