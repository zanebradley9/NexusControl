import express from "express";
import fetch from "node-fetch";

const router = express.Router();

let logs = [];

function sendToDiscord(webhook, payload) {
  if (!webhook) return;

  fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: payload }),
  }).catch(() => {});
}

// receive logs from frontend
router.post("/log", (req, res) => {
  const { type, data, message, severity, webhook, url, time } = req.body;

  const log = {
    type,
    data,
    message,
    severity,
    url,
    time,
  };

  logs.push(log);
  if (logs.length > 150) logs.shift();

  // only important ones go to Discord
  if (severity === "high" || severity === "critical") {
    const emoji = severity === "critical" ? "💥" : "🚨";

    sendToDiscord(
      webhook,
      `${emoji} [${severity.toUpperCase()}] ${type}\n${message}\nURL: ${url}`
    );
  }

  res.json({ success: true });
});

// dashboard endpoint
router.get("/logs", (req, res) => {
  res.json(logs);
});

export default router;