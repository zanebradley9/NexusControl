import { verify } from "../services/authService.js";

/**
 * Checks if user is logged in
 */
export function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  const user = verify(token);

  if (!user) {
    return res.status(403).json({
      error: "Invalid or expired token",
    });
  }

  req.user = user;

  next();
}

/**
 * Owner only access
 */
export function ownerOnly(req, res, next) {
  if (!req.user || req.user.role !== "owner") {
    return res.status(403).json({
      error: "Owner access only",
    });
  }

  next();
}