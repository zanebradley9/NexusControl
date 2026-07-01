import Stripe from "stripe";
import { ENV } from "./env.js";

if (!ENV.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
    apiVersion: "2025-04-30.basil",
});