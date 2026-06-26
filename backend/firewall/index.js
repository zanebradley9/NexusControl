import rateLimiter from "./rateLimiter.js";
import requestScanner from "./requestScanner.js";
import authShield from "./authShield.js";
import ipBlocker from "./ipBlocker.js";
import logger from "./logger.js";

export default function firewall(app) {
  /* =========================================
     LOGGING (FIRST - always safe)
  ========================================= */
  app.use(logger);

  /* =========================================
     CRITICAL FIX: ALLOW CORS PRELIGHT
     (THIS FIXES YOUR OPTIONS BLOCK ISSUE)
  ========================================= */
  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  /* =========================================
     IP BLOCKER (EARLY SAFETY)
  ========================================= */
  app.use(ipBlocker);

  /* =========================================
     RATE LIMITER (AFTER OPTIONS PASS)
  ========================================= */
  app.use(rateLimiter);

  /* =========================================
     REQUEST SCANNER (BODY ANALYSIS)
  ========================================= */
  app.use(requestScanner);

  /* =========================================
     AUTH SHIELD (JWT / SESSION GUARD)
  ========================================= */
  app.use(authShield);

  console.log("🛡️ NexusControl Firewall ACTIVE");
}