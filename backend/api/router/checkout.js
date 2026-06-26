import express from "express";
import { stripe } from "../../config/Stripe.js";

const router = express.Router();

/* =========================================
   CREATE CHECKOUT SESSION
========================================= */

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: "Missing priceId",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "https://nexus-control-delta.vercel.app/success",
      cancel_url: "https://nexus-control-delta.vercel.app/subscription",
    });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;