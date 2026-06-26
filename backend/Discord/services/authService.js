import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret";

const OWNER = {
  email: "owner@nexus.com",
  password: "admin123",
  role: "owner",
};

export function login(email, password) {
  if (email !== OWNER.email || password !== OWNER.password) {
    return null;
  }

  return jwt.sign(
    {
      email,
      role: "owner",
    },
    SECRET,
    { expiresIn: "7d" }
  );
}

export function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}