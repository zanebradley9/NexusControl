
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  /* ---------------- STATE ---------------- */

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] =
    useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [appPublicSettings, setAppPublicSettings] = useState(null);

  /* ---------------- USER AUTH ---------------- */

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);

      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error("Authentication failed:", error);

      setUser(null);
      setIsAuthenticated(false);

      if (error?.status === 401 || error?.status === 403) {
        setAuthError({
          type: "auth_required",
          message: "Authentication required",
        });
      } else {
        setAuthError({
          type: "unknown",
          message: error?.message || "Authentication failed",
        });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  /* ---------------- APP STATE ---------------- */

  const checkAppState = useCallback(async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // New Base44 SDK API
      const settings = await base44.public.getPublicSettings({
        appId: appParams.appId,
      });

      setAppPublicSettings(settings);

      if (appParams.token) {
        await checkUserAuth();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    } catch (error) {
      console.error("Failed loading app:", error);

      const reason = error?.data?.extra_data?.reason;

      switch (reason) {
        case "auth_required":
          setAuthError({
            type: "auth_required",
            message: "Authentication required",
          });
          break;

        case "user_not_registered":
          setAuthError({
            type: "user_not_registered",
            message: "User is not registered for this app",
          });
          break;

        default:
          setAuthError({
            type: reason || "unknown",
            message: error?.message || "Failed to load application",
          });
      }

      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } finally {
      setIsLoadingPublicSettings(false);
    }
  }, [checkUserAuth]);

  /* ---------------- LOGIN / LOGOUT ---------------- */

  const logout = useCallback((redirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    if (redirect) {
      base44.auth.logout(window.location.href);
    } else {
      base44.auth.logout();
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    base44.auth.redirectToLogin(window.location.href);
  }, []);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    checkAppState();
  }, [checkAppState]);

  /* ---------------- CONTEXT ---------------- */

  const value = {
    user,
    isAuthenticated,

    isLoadingAuth,
    isLoadingPublicSettings,

    authChecked,
    authError,

    appPublicSettings,

    checkUserAuth,
    checkAppState,

    logout,
    navigateToLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
};