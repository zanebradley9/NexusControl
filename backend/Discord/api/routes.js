import express from "express";
import Stripe from "stripe";

import notificationRoutes from "./notifications.js";
import scriptRoutes from "./script.js";

import { fetchRoles } from "../discord/roles.js";
import { sendPartnershipApplication } from "../discord/partnerships.js";

import { checkAuth, ownerOnly } from "./auth.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* =========================
   SUB ROUTES
========================= */
router.use("/notifications", notificationRoutes);
router.use("/script", scriptRoutes);

/* =========================
   ROLES
========================= */
router.get("/roles", async (req, res) => {
  try {
    const roles = await fetchRoles();
    res.json({ roles });
  } catch (err) {
    console.error("Roles error:", err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

/* =========================
   PARTNERSHIP
========================= */
router.post("/partnership", checkAuth, async (req, res) => {
  try {
    const result = await sendPartnershipApplication(req.body);
    res.json(result);
  } catch (err) {
    console.error("Partnership error:", err);
    res.status(500).json({ error: "Failed to send application" });
  }
});

/* =========================
   STRIPE CHECKOUT
========================= */
router.post("/create-checkout", async (req, res) => {
  try {
    const { plan } = req.body;

    const priceMap = {
      Pro: process.env.STRIPE_PRICE_PRO,
      Elite: process.env.STRIPE_PRICE_ELITE,
    };

    const priceId = priceMap[plan];

    if (!priceId) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/subscription?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   OWNER ONLY ROUTE
========================= */
router.get("/owner", checkAuth, ownerOnly, (req, res) => {
  res.json({
    message: "Welcome Owner 👑",
    user: req.user,
  });
});

export default router;