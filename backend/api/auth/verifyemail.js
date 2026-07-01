import User from "../../models/user.js";

export default async function verifyEmail(req, res) {
  const { token } = req.query;

  const user = await User.findOne({ emailToken: token });

  if (!user) return res.status(400).json({ message: "Invalid token" });

  user.isVerified = true;
  user.emailToken = null;

  await user.save();

  return res.json({ message: "Email verified successfully" });
}