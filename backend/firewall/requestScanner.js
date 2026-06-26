import rules from "./config.js";

export default function requestScanner(req, res, next) {
  const rawData =
    JSON.stringify(req.body || {}) +
    JSON.stringify(req.query || {}) +
    JSON.stringify(req.params || {});

  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  // Detect attack patterns
  const matchedPattern = rules.BLOCKED_PATTERNS.find(pattern =>
    rawData.toLowerCase().includes(pattern.toLowerCase())
  );

  if (matchedPattern) {
    console.log(
      `[FIREWALL] Threat blocked | IP: ${req.ip} | Pattern: ${matchedPattern}`
    );

    return res.status(403).json({
      success: false,
      error: "Threat detected"
    });
  }

  // Detect bad bots
  const badAgent = rules.BLOCKED_USER_AGENTS.find(agent =>
    userAgent.includes(agent.toLowerCase())
  );

  if (badAgent) {
    console.log(
      `[FIREWALL] Bad bot blocked | IP: ${req.ip} | Agent: ${badAgent}`
    );

    return res.status(403).json({
      success: false,
      error: "Blocked user-agent"
    });
  }

  // Detect oversized payloads
  const contentLength = parseInt(req.headers["content-length"] || "0");

  if (contentLength > rules.MAX_BODY_SIZE) {
    console.log(
      `[FIREWALL] Large payload blocked | IP: ${req.ip}`
    );

    return res.status(413).json({
      success: false,
      error: "Payload too large"
    });
  }

  next();
}