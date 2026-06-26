// routes/stripe.js

import express from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "YOUR_PRICE_ID",
          quantity: 1,
        },
      ],
      success_url: "https://yourwebsite.com/success",
      cancel_url: "https://yourwebsite.com/cancel",
    });

    res.json({
      url: session.url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;