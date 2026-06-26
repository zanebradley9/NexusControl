import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardCode() {
const navigate = useNavigate();

const player = {
name: "Player",
level: 1,
coins: 1000,
xp: 0,
};

return ( <div className="min-h-screen bg-gray-900 text-white p-6"> <h1 className="text-4xl font-bold mb-6">
NexusControl Dashboard </h1>

  {/* Player Stats */}
  <div className="bg-gray-800 rounded-lg p-4 mb-6">
    <h2 className="text-2xl font-semibold mb-3">
      Player Stats
    </h2>

    <p>Name: {player.name}</p>
    <p>Level: {player.level}</p>
    <p>Coins: {player.coins}</p>
    <p>XP: {player.xp}</p>
  </div>

  {/* Quick Actions */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

    <button
      className="bg-blue-600 p-4 rounded-lg"
      onClick={() => navigate("/gamestore/skills")}
    >
      Skill Store
    </button>

    <button
      className="bg-red-600 p-4 rounded-lg"
      onClick={() => navigate("/gamestore/guns")}
    >
      Gun Store
    </button>

    <button
      className="bg-yellow-600 p-4 rounded-lg"
      onClick={() => navigate("/gamestore/cars")}
    >
      Car Store
    </button>

    <button
      className="bg-green-600 p-4 rounded-lg"
      onClick={() => navigate("/dashboard/jarvis")}
    >
      Open Jarvis
    </button>

    <button
      className="bg-purple-600 p-4 rounded-lg"
      onClick={() => navigate("/scripts")}
    >
      Scripts
    </button>

    <button
      className="bg-gray-700 p-4 rounded-lg"
      onClick={() => navigate("/settings")}
    >
      Settings
    </button>

  </div>

  {/* Game Panel */}
  <div className="bg-gray-800 rounded-lg p-4 mt-6">
    <h2 className="text-2xl font-semibold mb-3">
      Game Status
    </h2>

    <p>World: Online</p>
    <p>NPCs: Active</p>
    <p>Weather: Sunny</p>
    <p>Animals: Active</p>
  </div>
</div>
);
}
