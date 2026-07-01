import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 5000,
    CLIENT_URL: process.env.CLIENT_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};