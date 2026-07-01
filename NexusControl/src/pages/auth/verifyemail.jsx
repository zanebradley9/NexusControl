import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexuscontrol-production.up.railway.app";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus("error");
          return;
        }

        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center max-w-md w-full">

        {status === "loading" && <p>Verifying email...</p>}

        {status === "success" && (
          <>
            <h1 className="text-green-400 text-xl font-bold">
              Email Verified!
            </h1>
            <Link className="text-cyan-400 mt-4 block" to="/login">
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-red-400 text-xl font-bold">
              Verification Failed
            </h1>
            <Link className="text-cyan-400 mt-4 block" to="/resend-verification">
              Resend Email
            </Link>
          </>
        )}
      </div>
    </div>
  );
}