import User from "../../models/user.js";

export default async function me(req, res) {
  const user = await User.findById(req.user.id).select("-password -refreshToken");
  if (!user) return res.status(404).json({ message: "Not found" });

  return res.json(user);
}