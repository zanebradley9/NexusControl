import React from "react";
import { useNavigate } from "react-router-dom";

export default function MainScreen() {
const navigate = useNavigate();

return ( <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6"> <h1 className="text-5xl font-bold mb-4">
NexusControl </h1>

  <p className="text-lg text-gray-300 mb-8">
    Welcome to your game and dashboard system.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
    <button
      className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg"
      onClick={() => navigate("/dashboard")}
    >
      Dashboard
    </button>

    <button
      className="bg-green-600 hover:bg-green-700 p-4 rounded-lg"
      onClick={() => navigate("/dashboard/jarvis")}
    >
      Jarvis AI
    </button>

    <button
      className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg"
      onClick={() => navigate("/gamestore/skills")}
    >
      Skill Store
    </button>

    <button
      className="bg-red-600 hover:bg-red-700 p-4 rounded-lg"
      onClick={() => navigate("/gamestore/guns")}
    >
      Gun Store
    </button>

    <button
      className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg"
      onClick={() => navigate("/gamestore/cars")}
    >
      Car Store
    </button>

    <button
      className="bg-gray-700 hover:bg-gray-800 p-4 rounded-lg"
      onClick={() => navigate("/login")}
    >
      Login
    </button>
  </div>

  <footer className="mt-10 text-sm text-gray-400">
    NexusControl © 2026
  </footer>
</div>

);
}
