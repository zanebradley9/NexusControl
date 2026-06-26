import { WebSocketServer } from "ws";

export function setupWebsocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", () => {
    console.log("🟢 WebSocket Connected");
  });

  return wss;
}