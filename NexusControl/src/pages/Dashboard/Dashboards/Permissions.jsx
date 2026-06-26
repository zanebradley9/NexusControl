import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_DISCORD_API_URL;

const WS_URL =
  import.meta.env.VITE_WS_URL;

export default function Permissions() {
  const [roles, setRoles] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/api/roles`
      );

      if (!res.ok) {
        throw new Error(
          `API Error ${res.status}`
        );
      }

      const data = await res.json();

      setRoles(data.roles || []);
    } catch (err) {
      console.error(err);

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();

    let ws;

    const connectSocket = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("🟢 Connected");
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(
            event.data
          );

          if (
            data.type ===
            "roles-update"
          ) {
            setRoles(
              data.roles || []
            );
          }
        } catch (err) {
          console.error(err);
        }
      };

      ws.onerror = (err) => {
        console.error(err);
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);

        setTimeout(
          connectSocket,
          5000
        );
      };
    };

    connectSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const filteredRoles =
    roles.filter((role) =>
      role.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Discord Permissions
        </h1>

        <button
          onClick={loadRoles}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="mb-4">
        Status:
        {" "}
        {connected ? (
          <span className="text-green-400">
            🟢 Connected
          </span>
        ) : (
          <span className="text-red-400">
            🔴 Offline
          </span>
        )}
      </div>

      <div className="mb-4">
        Total Roles:
        {" "}
        <strong>
          {roles.length}
        </strong>
      </div>

      <input
        type="text"
        placeholder="Search roles..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="w-full mb-4 px-3 py-2 rounded bg-zinc-800 border border-zinc-700"
      />

      {loading && (
        <div>
          Loading roles...
        </div>
      )}

      {error && (
        <div className="text-red-400 mb-4">
          {error}
        </div>
      )}

      {!loading &&
        filteredRoles.length === 0 && (
          <div className="text-zinc-400">
            No roles found
          </div>
        )}

      <div className="grid gap-2">
        {filteredRoles.map(
          (role) => (
            <div
              key={role.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex justify-between items-center"
            >
              <span>
                {role.name}
              </span>

              <span className="text-xs text-zinc-400">
                {role.id}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}