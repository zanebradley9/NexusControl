export function logDeletedAccount(user) {
  ensureFolders();

  const deletedDir = path.join(BASE_DIR, "_DELETED_ACCOUNTS");

  const filePath = path.join(
    deletedDir,
    `${user.name.replace(/\s+/g, "_")}_${Date.now()}.json`
  );

  const data = {
    name: user.name,
    email: user.email,
    deletedAt: new Date().toISOString(),
    reason: user.deleteReason || "Unknown",
    ip: user.ip ? hash(user.ip) : null,
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}