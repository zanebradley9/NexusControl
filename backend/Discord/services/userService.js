export function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
  };
}