const PREMIUM_MODULES = ["analytics"];

/**
 * Check if a user's plan allows access to a given module.
 * @param {{ plan?: string }} user
 * @param {string} moduleKey
 */
export function canUseModule(user, moduleKey) {
  if (PREMIUM_MODULES.includes(moduleKey) && user?.plan !== "premium") {
    return false;
  }
  return true;
}