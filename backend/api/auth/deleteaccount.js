import User from "../../models/user.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../../utils/email.js";
import { logAudit } from "../../utils/audit.js";
import { discordLog } from "../../utils/discord.js";

export default async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    const { password, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // generate deletion token (safety)
    const deleteToken = crypto.randomBytes(24).toString("hex");

    // set scheduled deletion (7 days)
    user.deleteRequested = true;
    user.deleteToken = deleteToken;
    user.deleteReason = reason || "No reason provided";
    user.deleteAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await user.save();

    // email warning
    await sendEmail(
      user.email,
      "⚠️ Account Deletion Requested (7-Day Warning)",
      `
Hello ${user.username || "User"},

We received a request to delete your account.

🧾 Reason: ${user.deleteReason}

⏳ Your account will be permanently deleted in 7 days:
📅 ${new Date(user.deleteAt).toDateString()}

If this was NOT you, please log in immediately and change your password.

Cancel deletion anytime by logging back in before the deadline.

If you still want to proceed, no action is required.

– NexusControl Security Team
      `
    );

    // audit log
    await logAudit({
      userId,
      action: "ACCOUNT_DELETE_REQUESTED",
      meta: { reason: user.deleteReason, deleteAt: user.deleteAt },
    });

    // discord log
    await discordLog(
      `⚠️ DELETE REQUEST\nUser: ${user.email}\nReason: ${user.deleteReason}\nDeletion in 7 days.`
    );

    return res.json({
      message: "Account deletion scheduled in 7 days",
      deleteAt: user.deleteAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}