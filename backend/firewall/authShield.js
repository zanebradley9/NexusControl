export default function authShield(req, res, next) {
  // ✅ ALWAYS allow preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  const protectedRoutes = [
    "/api/router",
    "/api/stripe",
    "/api/billing",
    "/api/checkout",
  ];

  const publicAuthRoutes = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
  ];

  const url = req.originalUrl;

  const isPublicAuth = publicAuthRoutes.some(route =>
    url.startsWith(route)
  );

  if (isPublicAuth) return next();

  const requiresProtection = protectedRoutes.some(route =>
    url.startsWith(route)
  );

  if (!requiresProtection) return next();

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  next();
}