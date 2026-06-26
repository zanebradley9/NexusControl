import {
  Check,
  Crown,
  Zap,
  Shield,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Pricing() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState("");

  const API =
    import.meta.env.VITE_API_URL ||
    "https://nexuscontrol-production.up.railway.app";

  const plans = [
    {
      name: "Free",
      icon: Shield,
      price: "$0",
      description:
        "Perfect for testing and personal use",
      highlight: false,
      priceId: null,
      features: [
        "Dashboard Access",
        "Limited Scripts",
        "Basic Logs",
        "Community Support",
      ],
    },

    {
      name: "Pro",
      icon: Zap,
      price: "$9",
      description:
        "Advanced automation for power users",
      highlight: true,
      badge: "MOST POPULAR",
      priceId:
        "price_1TYFP7ExZWJQGzBjEpdYIvtn",
      features: [
        "Unlimited Scripts",
        "Remote Commands",
        "Advanced Logs",
        "Notifications",
        "40-Day Free Trial",
      ],
    },

    {
      name: "Elite",
      icon: Crown,
      price: "$19",
      description:
        "Maximum control and admin tools",
      highlight: false,
      priceId:
        "price_1TYFRsExZWJQGzBj8awbra4D",
      features: [
        "Everything in Pro",
        "Admin Panel",
        "Priority Support",
        "Hidden Features",
        "Beta Access",
      ],
    },
  ];

  const handleSelect = async (plan) => {
    if (plan.name === "Free") {
      navigate("/dashboard");
      return;
    }

    if (!plan.priceId) {
      alert("Stripe Price ID missing.");
      return;
    }

    try {
      setLoading(plan.name);

      const response = await axios.post(
        `${API}/api/stripe/create-checkout-session`,
        {
          priceId: plan.priceId,
          plan: plan.name,
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      if (response.data?.url) {
        window.location.href =
          response.data.url;
      } else {
        alert(
          "Unable to create checkout session."
        );
      }
    } catch (error) {
      console.error(
        "Checkout Error:",
        error
      );

      alert(
        error?.response?.data?.error ||
          "Payment system unavailable."
      );
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold">
            NexusControl Pricing
          </h1>

          <p className="text-zinc-400 mt-4 text-lg">
            Choose the perfect plan for your
            automation needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 ${
                  plan.highlight
                    ? "border-cyan-400 bg-zinc-900 shadow-[0_0_40px_rgba(34,211,238,0.2)]"
                    : "border-zinc-800 bg-zinc-900/60"
                }`}
              >

                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-cyan-400 text-black px-4 py-1 rounded-full text-xs font-bold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-8 h-8 text-cyan-400" />

                  <h2 className="text-3xl font-bold">
                    {plan.name}
                  </h2>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold">
                    {plan.price}
                  </span>

                  {plan.name !== "Free" && (
                    <span className="text-zinc-400">
                      /month
                    </span>
                  )}
                </div>

                <p className="text-zinc-400 mb-8">
                  {plan.description}
                </p>

                <ul className="space-y-4 mb-8">
                  {plan.features.map(
                    (feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3"
                      >
                        <Check className="w-5 h-5 text-cyan-400" />

                        <span>
                          {feature}
                        </span>
                      </li>
                    )
                  )}
                </ul>

                <button
                  onClick={() =>
                    handleSelect(plan)
                  }
                  disabled={
                    loading === plan.name
                  }
                  className={`w-full py-4 rounded-xl font-bold transition ${
                    plan.highlight
                      ? "bg-cyan-400 text-black hover:bg-cyan-300"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {loading === plan.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting...
                    </span>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </button>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}