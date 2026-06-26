import express from "express";
import { stripe } from "../../config/Stripe.js";

const router = express.Router();

/**
 * CREATE CHECKOUT SESSION
 */
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: "http://localhost:5173/subscription?success=true",
      cancel_url: "http://localhost:5173/subscription?canceled=true",
    });

    res.json({
      url: session.url,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to create checkout session",
    });
  }
});

export default router;