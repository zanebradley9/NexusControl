import axios from "axios";

/* =========================
   CONFIG
========================= */

const BASE_URL =
  import.meta?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "https://nexuscontrol-production.up.railway.app/";

/* =========================
   TOKEN STORAGE
========================= */

const getToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");

const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

/* =========================
   AXIOS INSTANCE
========================= */

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // attach request id for tracing if backend supports it
  config.headers["X-Client"] = "NexusControl-Web";

  return config;
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const status = error?.response?.status;

    /* =========================
       AUTO REFRESH TOKEN
    ========================== */
    if (status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;

        setTokens({
          accessToken: newAccessToken,
        });

        original.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(original);
      } catch (err) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject({
      message:
        error?.response?.data?.message ||
        error.message ||
        "Network error",
      status,
    });
  }
);

/* =========================
   AUTH API
========================= */

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const signup = (data) =>
  api.post("/auth/signup", data);

export const logout = () =>
  api.post("/auth/logout");

/* =========================
   CHAT / AI
========================= */

export const sendChatMessage = (message) =>
  api.post("/chat", { message });

/* =========================
   SYSTEM
========================= */

export const getLogs = () => api.get("/logs");
export const getMemory = () => api.get("/memory");
export const getSecurityStatus = () => api.get("/security");

/* =========================
   TOKEN UTILITIES
========================= */

export { setTokens, clearTokens };

/* =========================
   DEFAULT EXPORT
========================= */
export default api;