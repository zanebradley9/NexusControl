const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexuscontrol-production.up.railway.app";

export const resendVerification = async (email) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to resend verification");
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
};