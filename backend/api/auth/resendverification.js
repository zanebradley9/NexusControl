import User from "../../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../../utils/email.js";

export default async function resendVerification(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If exists, email sent" });

  const token = crypto.randomBytes(32).toString("hex");
  user.emailToken = token;

  await user.save();

  const link = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail(email, "Verify Email", `Verify: ${link}`);

  return res.json({ message: "Verification sent" });
}