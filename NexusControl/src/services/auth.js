const API_URL =
  `${import.meta.env.VITE_API_URL}/api/auth`;

/* ==================================
   GENERIC REQUEST
================================== */

async function apiRequest(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      credentials: "include",

      headers: {
        "Content-Type":
          "application/json",

        ...options.headers,
      },

      ...options,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Invalid response from backend"
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Request failed"
    );
  }

  return data;
}

/* ==================================
   LOGIN
================================== */

export async function login(
  email,
  password
) {
  const data = await apiRequest(
    "/login",
    {
      method: "POST",

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (data.token) {
    saveToken(data.token);
  }

  return data;
}

/* ==================================
   SIGNUP
================================== */

export async function signup(
  email,
  password
) {
  return apiRequest("/signup", {
    method: "POST",

    body: JSON.stringify({
      email,
      password,
    }),
  });
}

/* ==================================
   CURRENT USER
================================== */

export async function getCurrentUser() {
  return apiRequest("/me", {
    headers: authHeader(),
  });
}

/* ==================================
   REFRESH TOKEN
================================== */

export async function refreshToken() {
  const data = await apiRequest(
    "/refresh",
    {
      method: "POST",
    }
  );

  if (data.token) {
    saveToken(data.token);
  }

  return data;
}

/* ==================================
   TOKEN STORAGE
================================== */

export function saveToken(token) {
  localStorage.setItem(
    "token",
    token
  );
}

export function getToken() {
  return localStorage.getItem(
    "token"
  );
}

export function removeToken() {
  localStorage.removeItem(
    "token"
  );
}

/* ==================================
   AUTH
================================== */

export function isAuthenticated() {
  return !!getToken();
}

export function authHeader() {
  const token = getToken();

  return token
    ? {
        Authorization:
          `Bearer ${token}`,
      }
    : {};
}

/* ==================================
   LOGOUT
================================== */

export async function logout() {
  try {
    await apiRequest("/logout", {
      method: "POST",

      headers: authHeader(),
    });
  } catch (err) {
    console.warn(
      "Logout warning:",
      err.message
    );
  }

  removeToken();
}