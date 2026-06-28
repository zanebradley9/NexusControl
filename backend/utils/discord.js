// backend/utils/discord.js

import { EmbedBuilder } from "discord.js";

let client = null;

/**
 * Register your Discord client once after logging in.
 */
export function setDiscordClient(discordClient) {
    client = discordClient;
}

/**
 * Send a message to the configured log channel.
 */
export async function discordLog(content, options = {}) {
    try {
        if (!client) {
            console.log("[Discord]", content);
            return false;
        }

        const channelId =
            options.channelId ||
            process.env.DISCORD_LOG_CHANNEL_ID ||
            process.env.LOG_CHANNEL_ID;

        if (!channelId) {
            console.log("[Discord]", content);
            return false;
        }

        const channel = await client.channels.fetch(channelId);

        if (!channel) {
            console.warn("Discord log channel not found.");
            return false;
        }

        await channel.send({
            content: String(content).slice(0, 2000),
        });

        return true;
    } catch (err) {
        console.error("Discord Log Error:", err.message);
        return false;
    }
}

/**
 * Send an embed.
 */
export async function sendEmbed(title, description, color = 0x5865f2) {
    try {
        if (!client) return false;

        const channelId =
            process.env.DISCORD_LOG_CHANNEL_ID ||
            process.env.LOG_CHANNEL_ID;

        if (!channelId) return false;

        const channel = await client.channels.fetch(channelId);

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();

        await channel.send({
            embeds: [embed],
        });

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

/**
 * Mention helpers
 */
export const mentionUser = (id) => `<@${id}>`;
export const mentionRole = (id) => `<@&${id}>`;
export const mentionChannel = (id) => `<#${id}>`;

/**
 * Discord Snowflake validator
 */
export function isDiscordId(id) {
    return /^[0-9]{17,20}$/.test(String(id));
}

/**
 * Create Discord timestamp
 */
export function discordTimestamp(date = new Date(), style = "F") {
    const unix = Math.floor(new Date(date).getTime() / 1000);
    return `<t:${unix}:${style}>`;
}