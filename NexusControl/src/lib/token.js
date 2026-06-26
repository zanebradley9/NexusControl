const TOKEN_KEY = "token";

/** Get the stored session token from localStorage. */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Save a session token to localStorage. */
// @ts-ignore
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Remove the token and effectively log the user out. */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Build the Authorization header object for fetch requests. */
export function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + getToken()
  };
}