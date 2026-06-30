import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexuscontrol-production.up.railway.app";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      clearTimeout(timeout);

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid server response");
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Login failed");
      }

      if (!data.token) {
        throw new Error("Missing authentication token");
      }

      // Store auth safely (single source of truth)
      localStorage.setItem("accessToken", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // optional legacy support (remove later if not needed)
      if (data.save) {
        localStorage.setItem("save", JSON.stringify(data.save));
      }

      // redirect
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (err.name === "AbortError") {
        setError("Request timed out. Try again.");
      } else {
        setError(err.message || "Server error");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">NexusControl</h1>
          <p className="text-zinc-400 mt-2">Login to your account</p>
          <p className="text-xs text-zinc-500 mt-2 break-all">
            API: {API_URL}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              autoComplete="current-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-zinc-400 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-cyan-400 hover:bg-cyan-300 transition text-black font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="text-zinc-400 text-sm text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-cyan-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}