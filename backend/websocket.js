import { Server } from "socket.io";
import { routeAgent } from "./ai-core/agents/router.js";
export function setupWebsocket(server) {
const io = new Server(server, {
cors: {
origin: "*"
}
});
io.on("connection", (socket) => {
console.log("Client connected", socket.id);
socket.on("jarvis-message", async (data) => {
try {
const response = await routeAgent(data.message);
socket.emit("jarvis-response", {
success: true,
response
});
} catch (err) {
socket.emit("jarvis-response", {
success: false,
error: err.message
});
}
});
socket.on("disconnect", () => {
console.log("Disconnected", socket.id);
});
});
}
