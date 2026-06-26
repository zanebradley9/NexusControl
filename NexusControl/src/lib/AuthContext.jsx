// @ts-ignore
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';

import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext(null);

// @ts-ignore
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);

  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [appPublicSettings, setAppPublicSettings] = useState(null);

  /* ---------------- APP STATE CHECK ---------------- */

  const checkAppState = useCallback(async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      const appClient = createAxiosClient({
        baseURL: `/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId || '',
        },
        // @ts-ignore
        token: appParams.token || null,
        interceptResponses: true,
      });

      try {
        const publicSettings = await appClient.get(
          `/prod/public-settings/by-id/${appParams.appId}`
        );

        // @ts-ignore
        setAppPublicSettings(publicSettings);

        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }

        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);

        // @ts-ignore
        const reason = appError?.data?.extra_data?.reason;

        // @ts-ignore
        if (appError.status === 403 && reason) {
          if (reason === 'auth_required') {
            setAuthError({
              // @ts-ignore
              type: 'auth_required',
              message: 'Authentication required',
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              // @ts-ignore
              type: 'user_not_registered',
              message: 'User not registered for this app',
            });
          } else {
            setAuthError({
              // @ts-ignore
              type: reason,
              // @ts-ignore
              message: appError.message,
            });
          }
        } else {
          setAuthError({
            // @ts-ignore
            type: 'unknown',
            // @ts-ignore
            message: appError?.message || 'Failed to load app',
          });
        }

        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);

      setAuthError({
        // @ts-ignore
        type: 'unknown',
        // @ts-ignore
        message: error?.message || 'An unexpected error occurred',
      });

      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  }, []);

  /* ---------------- USER AUTH CHECK ---------------- */

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);

      const currentUser = await base44.auth.me();

      // @ts-ignore
      setUser(currentUser);
      setIsAuthenticated(true);

      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('User auth check failed:', error);

      setUser(null);
      setIsAuthenticated(false);

      setIsLoadingAuth(false);
      setAuthChecked(true);

      // @ts-ignore
      if (error?.status === 401 || error?.status === 403) {
        setAuthError({
          // @ts-ignore
          type: 'auth_required',
          message: 'Authentication required',
        });
      }
    }
  }, []);

  /* ---------------- AUTH ACTIONS ---------------- */

  const logout = useCallback((shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
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

  /* ---------------- CONTEXT VALUE ---------------- */

  const value = {
    user,
    isAuthenticated,

    isLoadingAuth,
    isLoadingPublicSettings,

    authError,
    appPublicSettings,
    authChecked,

    logout,
    navigateToLogin,
    checkUserAuth,
    checkAppState,
  };

  return (
    <AuthContext.Provider 
// @ts-ignore
    value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};