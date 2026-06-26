import User from "../../models/User.js";
import bcrypt from "bcryptjs";

export default async function resetPassword(req, res) {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExp: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  const hashed = await bcrypt.hash(password, 12);

  user.password = hashed;
  user.resetToken = null;
  user.resetTokenExp = null;

  await user.save();

  return res.json({ message: "Password reset successful" });
}