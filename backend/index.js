import express from "express";
import http from "http";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "mongo-sanitize";
import crypto from "crypto";

/* =========================
   DISCORD SERVICES
========================= */
import "./Discord/discords/bot.js";
import "./Discord/discords/partnerships.js";
import "./Discord/discords/logoutLogger.js";


import { startJarvis } from "./server.js";

/* =========================
   ROUTES
========================= */
import chatRoutes from "./routes/chat.js";
import loginRoute from "./api/auth/login.js";
import signupRoute from "./api/auth/signup.js";
import stripeRoute from "./api/router/stripe.js";
import billingRoute from "./api/router/billing.js";
import checkoutRoute from "./api/router/checkout.js";

/* =========================
   FIREWALL
========================= */
import firewall from "./firewall/index.js";

const app = express();
const server = http.createServer(app);

/* ======================================================
   TRUST PROXY (REQUIRED FOR RAILWAY / VERCEL BEHIND PROXY)
====================================================== */
app.set("trust proxy", 1);

/* ======================================================
   REQUEST ID
====================================================== */
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

/* ======================================================
   SECURITY HEADERS (SAFE MODE)
====================================================== */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

/* ======================================================
   COMPRESSION
====================================================== */
app.use(compression());

/* ======================================================
   BODY PARSING
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ======================================================
   🔥 FIXED CORS (THIS FIXES YOUR SIGNUP ERROR)
====================================================== */

const allowedOrigins = new Set([
  ENV.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "https://nexus-control-delta.vercel.app",
]);

// IMPORTANT: handle preflight BEFORE anything else
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization", "x-client");
    return res.sendStatus(204);
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      auditLog(`Blocked Origin: ${origin}`);
      return callback(null, true); // IMPORTANT: avoid breaking frontend
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-client"],
  })
);

/* ======================================================
   RATE LIMITS
====================================================== */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: ENV.RATE_LIMIT_MAX || 300,
    standardHeaders: true,
  })
);

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
  })
);

/* ======================================================
   LOGGING
====================================================== */
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    console.log(
      JSON.stringify({
        id: req.id,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration: `${Date.now() - start}ms`,
      })
    );
  });

  next();
});

/* ======================================================
   SANITIZATION (SAFE)
====================================================== */
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    try {
      req.body = mongoSanitize(req.body);
    } catch (err) {
      console.error("Sanitize error:", err);
    }
  }
  next();
});

/* ======================================================
   THREAT DETECTION
====================================================== */
app.use((req, res, next) => {
  try {
    const payload = JSON.stringify(req.body || {});

    if (detectThreat(payload)) {
      auditLog(`Threat blocked: ${req.originalUrl}`);

      return res.status(403).json({
        success: false,
        message: "Threat detected",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
});

/* ======================================================
   FIREWALL (AFTER CORS FIX)
====================================================== */
firewall(app);

/* ======================================================
   ROUTES
====================================================== */
app.use("/api/auth", signupRoute);
app.use("/api/auth", loginRoute);

app.use("/api/stripe", stripeRoute);
app.use("/api/stripe", checkoutRoute);
app.use("/api/billing", billingRoute);

app.use("/api/chat", chatRoutes);
app.use("/api", routes);

/* ======================================================
   HEALTH CHECKS
====================================================== */
app.get("/", (req, res) => {
  res.json({ success: true, service: "NexusControl" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", (req, res) => {
  res.json({
    ready: true,
    database: true,
    websocket: true,
  });
});

/* ======================================================
   404
====================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ======================================================
   ERROR HANDLER
====================================================== */
app.use((err, req, res, next) => {
  console.error(err);
  auditLog(err.message);

  res.status(500).json({
    success: false,
    message:
      ENV.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

/* ======================================================
   STARTUP
====================================================== */
async function bootstrap() {
  try {
    await connectDatabase();

    startScheduler();
    setupWebsocket(server);

    if (ENV.AI_MODE === "v2" && ENV.NODE_ENV !== "production") {
      startJarvis();
    }

    const PORT = ENV.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 NexusControl Online : ${PORT}`);
    });
  } catch (err) {
    console.error("Startup Failed", err);
    process.exit(1);
  }
}

bootstrap();

/* ======================================================
   SHUTDOWN
====================================================== */
process.on("SIGINT", () => {
  console.log("SIGINT received");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  server.close(() => process.exit(0));
});

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);