import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckout = async (req, res) => {
  try {
    const { plan } = req.body;

    // Map your plans to Stripe Price IDs
    const priceMap = {
      Free: null, // no payment
      Pro: process.env.STRIPE_PRICE_PRO,
      Elite: process.env.STRIPE_PRICE_ELITE,
    };

    const priceId = priceMap[plan];

    if (!priceId) {
      return res.status(400).json({ error: "Invalid plan or free plan" });
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

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};