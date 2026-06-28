import mongoose from "mongoose";
import { ENV } from "../config/env.js";

let connected = false;

export async function connectDatabase() {
    try {
        if (connected) return;

        if (!ENV.MONGO_URI) {
            throw new Error("MONGO_URI missing in .env");
        }

        const conn = await mongoose.connect(ENV.MONGO_URI, {
            dbName: "NexusControl",
        });

        connected = true;

        console.log("✅ MongoDB Connected:", conn.connection.host);
    } catch (err) {
        console.error("❌ MongoDB connection failed");
        console.error(err.message);
        process.exit(1);
    }
}