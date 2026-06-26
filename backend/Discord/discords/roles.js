import { client } from "./bot.js";
import { ENV } from "../config/env.js";

export async function fetchRoles() {
  try {
    const guild = await client.guilds.fetch(ENV.GUILD_ID);
    const roles = await guild.roles.fetch();

    return [...roles.values()].map((role) => ({
      id: role.id,
      name: role.name,
      color: role.hexColor,
    }));
  } catch (err) {
    console.log("❌ Failed fetching roles:", err.message);
    return [];
  }
}