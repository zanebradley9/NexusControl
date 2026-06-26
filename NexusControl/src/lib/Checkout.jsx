import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const plan = location.state?.plan || "Free";

  const API =
    import.meta.env.VITE_API_URL ||
    "https://nexuscontrol-production-c59d.up.railway.app";

  const handleCheckout = async () => {
    if (plan === "Free") {
      navigate("/dashboard");
      return;
    }

    let priceId = "";

    if (plan === "Pro") {
      priceId = "price_1TYFP7ExZWJQGzBjEpdYIvtn";
    }

    if (plan === "Elite") {
      priceId = "price_1TYFRsExZWJQGzBj8awbra4D";
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API}/api/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan,
            priceId,
          }),
        }
      );

      const data = await res.json();

      console.log("Stripe Response:", data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h1 className="text-3xl font-bold mb-4">
          NexusControl Checkout
        </h1>

        <p className="text-zinc-400 mb-6">
          Selected Plan:
        </p>

        <div className="bg-zinc-800 rounded-xl p-4 mb-6">
          <h2 className="text-2xl font-semibold text-cyan-400">
            {plan}
          </h2>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Continue to Payment"}
        </button>

        <button
          onClick={() => navigate("/subscription")}
          className="w-full mt-3 border border-zinc-700 hover:bg-zinc-800 py-3 rounded-xl transition"
        >
          Back
        </button>

      </div>
    </div>
  );
}