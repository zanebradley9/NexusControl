import fs from "fs";

const LOG_FILE = "./database/logs.json";

export function addLog(type, message) {
  const logs = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));

  logs.push({
    id: Date.now().toString(),
    type,
    message,
    createdAt: new Date().toISOString(),
  });

  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}