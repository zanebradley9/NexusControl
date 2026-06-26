import jwt from "jsonwebtoken";

/* =========================
   AUTH CHECK
========================= */
export function checkAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* =========================
   ADMIN ONLY
========================= */
export function adminOnly(req, res, next) {
  if (req.user.role !== "admin" && req.user.role !== "owner") {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}

/* =========================
   OWNER ONLY
========================= */
export function ownerOnly(req, res, next) {
  if (req.user.role !== "owner") {
    return res.status(403).json({ error: "Owner only" });
  }
  next();
}