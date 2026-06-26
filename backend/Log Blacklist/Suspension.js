export function logBlacklist(user) {
  ensureFolders();

  const folder = getLetterFolder(user.name);
  const filePath = path.join(
    BASE_DIR,
    folder,
    `${user.name.replace(/\s+/g, "_")}.json`
  );

  const data = {
    name: user.name,
    email: user.email,
    ip: user.ip ? hash(user.ip) : null,
    reason: user.reason,
    status: "BLOCKED",
    suspendedAt: new Date().toISOString(),
    suspensionEndsAt: user.suspensionEndsAt,
    countdownDays:
      Math.ceil((user.suspensionEndsAt - Date.now()) / (1000 * 60 * 60 * 24)),
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}