import { createContext, useContext, useEffect, useState } from 'react';
import {
  getCustomerProfile,
  loginCustomer,
  logoutCustomer
} from '../api/customerAuthApi';
import { bindCustomerAuthStore } from '../api/customerAxiosInstance';

const CustomerAuthContext = createContext(null);
const STORAGE_KEY = 'logistics_dms_customer_auth';

const getStoredSession = () => {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  return storedValue ? JSON.parse(storedValue) : null;
};

export const CustomerAuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => getStoredSession());
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = (data) => {
    setSession(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (payload) => {
    const data = await loginCustomer(payload);
    persistSession(data);
    return data;
  };

  const logout = async () => {
    try {
      if (session?.refreshToken) {
        await logoutCustomer(session.refreshToken);
      }
    } finally {
      clearSession();
    }
  };

  const refreshProfile = async () => {
    const data = await getCustomerProfile();
    const currentSession = getStoredSession() || {};

    persistSession({
      ...currentSession,
      user: data.user,
      customer: data.customer
    });

    return data;
  };

  const updateSession = (data) => {
    const currentSession = getStoredSession() || {};
    persistSession({
      ...currentSession,
      ...data
    });
  };

  useEffect(() => {
    bindCustomerAuthStore({
      getAccessToken: () => getStoredSession()?.accessToken || null,
      getRefreshToken: () => getStoredSession()?.refreshToken || null,
      updateSession,
      clearSession
    });
  }, [session]);

  useEffect(() => {
    let isMounted = true;

    const hydrateProfile = async () => {
      if (!session?.accessToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getCustomerProfile();
        const currentSession = getStoredSession() || {};

        if (isMounted) {
          persistSession({
            ...currentSession,
            user: data.user,
            customer: data.customer
          });
        }
      } catch (error) {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken]);

  return (
    <CustomerAuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        customer: session?.customer || null,
        accessToken: session?.accessToken || null,
        isAuthenticated: Boolean(session?.accessToken),
        isLoading,
        login,
        logout,
        refreshProfile,
        updateSession,
        clearSession
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
