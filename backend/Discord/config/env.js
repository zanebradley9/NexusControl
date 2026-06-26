import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3001,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  GUILD_ID: process.env.GUILD_ID,

  PARTNERSHIP_CHANNEL_ID: process.env.PARTNERSHIP_CHANNEL_ID,
  GENERAL_CHAT_ID: process.env.GENERAL_CHAT_ID,
  STAFF_CHAT_ID: process.env.STAFF_CHAT_ID,
  OWNER_CHAT_ID: process.env.OWNER_CHAT_ID,
  BUSINESS_CHAT_ID: process.env.BUSINESS_CHAT_ID,
  COMMAND_CHAT_ID: process.env.COMMAND_CHAT_ID,
  JWT_SECRET: process.env.JWT_SECRET,
  BASE44_URL: process.env.BASE44_URL,
};