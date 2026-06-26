import LogoutLog from "../../models/logoutLog.js";
import { sendLogoutLog } from "../../Discord/discords/logoutLogger.js";

await LogoutLog.create({
  userId: user._id,
  email: user.email,
  username: user.username,
  ip: req.ip,
  userAgent: req.headers["user-agent"],
});

await sendLogoutLog({
  username: user.username,
  email: user.email,
  reason: "manual",
});