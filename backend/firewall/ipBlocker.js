import config from "./config.js";

export default function ipBlocker(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;

  if (config.BLOCKED_IPS?.includes(ip)) {
    console.log(`[FIREWALL] Blocked IP: ${ip}`);

    return res.status(403).json({
      success: false,
      error: "Access denied"
    });
  }

  next();
}