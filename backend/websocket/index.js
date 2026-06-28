import { WebSocketServer } from "ws";

let wss = null;

export function setupWebsocket(server) {
  if (wss) {
    console.log("[WEBSOCKET] Already running.");
    return wss;
  }

  wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    console.log("[WEBSOCKET] Client connected.");

    socket.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to NexusControl WebSocket",
        time: new Date().toISOString(),
      })
    );

    socket.on("message", (message) => {
      console.log("[WEBSOCKET] Received:", message.toString());

      socket.send(
        JSON.stringify({
          type: "echo",
          message: message.toString(),
        })
      );
    });

    socket.on("close", () => {
      console.log("[WEBSOCKET] Client disconnected.");
    });

    socket.on("error", (err) => {
      console.error("[WEBSOCKET] Error:", err);
    });
  });

  console.log("[WEBSOCKET] Ready.");

  return wss;
}

export function broadcast(data) {
  if (!wss) return;

  const payload = JSON.stringify(data);

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}