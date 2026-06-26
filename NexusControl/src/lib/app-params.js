const isNode = typeof window === 'undefined';

/* ---------------- SAFE STORAGE ---------------- */

const storage = (() => {
  if (isNode) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  try {
    return window.localStorage;
  } catch {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
})();

/* ---------------- HELPERS ---------------- */

const toSnakeCase = (str = '') => {
  return String(str)
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase();
};

/* ---------------- PARAM FETCHER ---------------- */

const getAppParamValue = (
  // @ts-ignore
  paramName,
  { defaultValue = undefined, removeFromUrl = false } = {}
) => {
  if (isNode) return defaultValue ?? null;

  try {
    const urlParams = new URLSearchParams(window.location.search);

    const searchParam = urlParams.get(paramName);

    const storageKey = `base44_${toSnakeCase(paramName)}`;

    // REMOVE FROM URL IF REQUIRED
    if (removeFromUrl && searchParam) {
      urlParams.delete(paramName);

      const newUrl = `${window.location.pathname}${
        urlParams.toString() ? `?${urlParams.toString()}` : ''
      }${window.location.hash}`;

      window.history.replaceState({}, document.title, newUrl);
    }

    // FROM URL
    if (searchParam) {
      storage.setItem(storageKey, searchParam);
      return searchParam;
    }

    // FROM DEFAULT
    if (defaultValue !== undefined && defaultValue !== null) {
      storage.setItem(storageKey, String(defaultValue));
      return defaultValue;
    }

    // FROM STORAGE
    const storedValue = storage.getItem(storageKey);

    if (storedValue !== null && storedValue !== undefined) {
      return storedValue;
    }

    return null;
  } catch (err) {
    console.error('getAppParamValue error:', err);
    return defaultValue ?? null;
  }
};

/* ---------------- APP PARAMS ---------------- */

const getAppParams = () => {
  try {
    const clearToken = getAppParamValue('clear_access_token');

    if (clearToken === 'true') {
      storage.removeItem('base44_access_token');
      storage.removeItem('token');
    }

    return {
      appId: getAppParamValue('app_id', {
        // @ts-ignore
        defaultValue: import.meta.env?.VITE_BASE44_APP_ID,
      }),

      token: getAppParamValue('access_token', {
        removeFromUrl: true,
      }),

      fromUrl: getAppParamValue('from_url', {
        // @ts-ignore
        defaultValue: typeof window !== 'undefined' ? window.location.href : '',
      }),

      functionsVersion: getAppParamValue('functions_version', {
        // @ts-ignore
        defaultValue: import.meta.env?.VITE_BASE44_FUNCTIONS_VERSION,
      }),

      appBaseUrl: getAppParamValue('app_base_url', {
        // @ts-ignore
        defaultValue: import.meta.env?.VITE_BASE44_APP_BASE_URL,
      }),
    };
  } catch (err) {
    console.error('getAppParams error:', err);

    return {
      appId: null,
      token: null,
      fromUrl: null,
      functionsVersion: null,
      appBaseUrl: null,
    };
  }
};

/* ---------------- EXPORT ---------------- */

export const appParams = {
  ...getAppParams(),
};