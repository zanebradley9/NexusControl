import { client } from "./bot.js";
import { ENV } from "../config/env.js";

export async function sendToDiscord(channel, message) {
  let channelId = ENV.GENERAL_CHAT_ID;

  if (channel === "staff") channelId = ENV.STAFF_CHAT_ID;
  if (channel === "owner") channelId = ENV.OWNER_CHAT_ID;
  if (channel === "business") channelId = ENV.BUSINESS_CHAT_ID;
  if (channel === "commands") channelId = ENV.COMMAND_CHAT_ID;

  const discordChannel = await client.channels.fetch(channelId);
  await discordChannel.send(message);
}