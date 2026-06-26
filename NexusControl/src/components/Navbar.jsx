import { useEffect, useState } from "react";
import { socket } from "../services/socket";

export default function Navbar() {
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    socket.on("connect", () => {
      setStatus("online");
    });

    socket.on("disconnect", () => {
      setStatus("offline");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div style={styles.nav}>
      <div style={styles.left}>
        <h2>🧠 NexusControl</h2>
      </div>

      <div style={styles.center}>
        <span>AI System:</span>
        <span
          style={{
            color: status === "online" ? "lime" : "red",
            marginLeft: 8,
          }}
        >
          {status.toUpperCase()}
        </span>
      </div>

      <div style={styles.right}>
        <button>Dashboard</button>
        <button>Logs</button>
        <button>Security</button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    background: "#111",
    color: "white",
  },
  left: {},
  center: { display: "flex", gap: 10, alignItems: "center" },
  right: { display: "flex", gap: 10 },
};