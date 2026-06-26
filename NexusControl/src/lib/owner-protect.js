/**
 * Returns true if the user is a locked owner (protected from modification).
 * @param {{ role: string, locked: boolean }} user
 */
export function protectOwner(user) {
  return user?.role === "owner" && user?.locked === true;
}