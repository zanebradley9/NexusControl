import express from "express";
import { stripe } from "../../config/Stripe.js";

const router = express.Router();

/* =========================================
   CREATE CHECKOUT SESSION
========================================= */

router.post(
  "/create-checkout-session",
  async (req, res) => {
   console.log("BODY RECEIVED:", req.body);
    
   try {
      const { priceId, plan } = req.body || {};

      if (!priceId) {
        return res.status(400).json({
          success: false,
          error: "Missing Stripe priceId",
        });
      }

      const session =
        await stripe.checkout.sessions.create({
          payment_method_types: ["card"],

          mode: "subscription",

          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],

          success_url:
            "https://nexus-control-delta.vercel.app/success",

          cancel_url:
            "https://nexus-control-delta.vercel.app/subscription",

          metadata: {
            plan,
          },
        });

      res.json({
        success: true,
        url: session.url,
      });
    } catch (error) {
      console.error(
        "❌ Stripe Checkout Error:",
        error
      );

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/* =========================================
   STRIPE WEBHOOK
========================================= */

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig =
      req.headers["stripe-signature"];

    let event;

    try {
      event =
        stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env
            .STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
      console.error(
        "❌ Webhook verification failed:",
        err.message
      );

      return res
        .status(400)
        .send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object;

        console.log(
          "💳 Checkout completed:",
          session.id
        );

        break;
      }

      case "customer.subscription.created": {
        const sub =
          event.data.object;

        console.log(
          "🟢 Subscription created:",
          sub.id
        );

        break;
      }

      case "customer.subscription.deleted": {
        const sub =
          event.data.object;

        console.log(
          "🔴 Subscription canceled:",
          sub.id
        );

        break;
      }

      default:
        console.log(
          `⚠️ Unhandled event: ${event.type}`
        );
    }

    res.json({
      received: true,
    });
  }
);

export default router;