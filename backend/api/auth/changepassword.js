import User from "../../models/user.js";
import bcrypt from "bcryptjs";

export default async function changePassword(req, res) {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(userId);

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return res.json({ message: "Password updated" });
}