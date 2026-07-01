import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexuscontrol-production.up.railway.app";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    if (!token) {
      setError("Invalid or missing reset token");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Reset failed");
      }

      setSuccess("Password reset successful. Redirecting...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timed out");
      } else {
        setError(err.message || "Server error");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">

        <h1 className="text-white text-2xl font-bold mb-2">
          Reset Password
        </h1>

        <p className="text-zinc-400 text-sm mb-6">
          Enter your new password
        </p>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-400 text-sm mb-3">{success}</p>}

        <form onSubmit={handleReset} className="space-y-4">

          <input
            type="password"
            placeholder="New password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
          />

          <input
            type="password"
            placeholder="Confirm password"
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
          />

          <button
            disabled={loading}
            className="w-full bg-cyan-400 text-black font-bold py-3 rounded-xl"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}