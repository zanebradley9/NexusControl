import { ChannelType } from "discord.js";
import { client } from "./bot.js";
import { ENV } from "../config/env.js";
import { buildTicketName } from "../services/ticketService.js";

export async function createTicket(application) {
  const guild = await client.guilds.fetch(ENV.GUILD_ID);

  const channel = await guild.channels.create({
    name: buildTicketName(application.name),
    type: ChannelType.GuildText,
  });

  await channel.send(`🤝 Partnership ticket for ${application.name}`);

  return channel;
}