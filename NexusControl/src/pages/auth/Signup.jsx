import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexuscontrol-production.up.railway.app";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    if (!email.trim()) {
      return "Email is required";
    }

    if (!password.trim()) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (
      username &&
      !/^[a-zA-Z0-9_-]+$/.test(username)
    ) {
      return "Username can only contain letters, numbers, _ and -";
    }

    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 15000);

      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "Backend returned non-JSON:",
          text
        );

        throw new Error(
          "Invalid response from backend"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Signup failed"
        );
      }

      if (!data.success) {
        throw new Error(
          data.message || "Signup failed"
        );
      }

      if (data.token) {
        localStorage.setItem(
          "accessToken",
          data.token
        );
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      setSuccess(
        "Account created successfully!"
      );

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Signup error:", err);

      if (err.name === "AbortError") {
        setError(
          "Request timed out. Please try again."
        );
      } else {
        setError(
          err.message || "Signup failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">
            NexusControl
          </h1>

          <p className="text-zinc-400 mt-2">
            Create your account
          </p>

          <p className="text-xs text-zinc-500 mt-2">
            API: {API_URL}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-400 text-sm">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSignup}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Username (optional)"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
          />

          <input
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
          />

          <input
            type="password"
            placeholder="Password"
            required
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white outline-none focus:border-cyan-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 transition text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="text-zinc-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}