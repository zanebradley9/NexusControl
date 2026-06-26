import axios from "axios";

export async function sendLogoutLog(data) {
  try {
    if (!process.env.DISCORD_LOG_WEBHOOK)
      return;

    await axios.post(
      process.env.DISCORD_LOG_WEBHOOK,
      {
        embeds: [
          {
            title: "🚪 User Logout",
            color: 0xff9900,

            fields: [
              {
                name: "User",
                value:
                  data.username ||
                  "Unknown",
                inline: true,
              },
              {
                name: "Email",
                value:
                  data.email ||
                  "Unknown",
                inline: true,
              },
              {
                name: "Reason",
                value:
                  data.reason ||
                  "manual",
                inline: true,
              },
            ],

            timestamp:
              new Date().toISOString(),
          },
        ],
      }
    );
  } catch (err) {
    console.error(
      "DISCORD LOGOUT LOG ERROR:",
      err.message
    );
  }
}