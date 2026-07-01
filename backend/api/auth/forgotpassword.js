import User from "../../models/user.js";
import crypto from "crypto";
import { sendEmail } from "../../utils/email.js";

export default async function forgotPassword(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If email exists, reset link sent" });

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExp = Date.now() + 1000 * 60 * 30; // 30 min
  await user.save();

  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await sendEmail(email, "Reset Password", `Reset here: ${link}`);

  return res.json({ message: "Reset email sent" });
}