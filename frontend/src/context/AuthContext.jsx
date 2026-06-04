import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance, { bindAuthStore } from '../api/axiosInstance';

const AuthContext = createContext(null);
const STORAGE_KEY = 'logistics_dms_auth';

const getStoredSession = () => {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  return storedValue ? JSON.parse(storedValue) : null;
};

export const AuthProvider = ({ children }) => {
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
    const response = await axiosInstance.post('/auth/login', payload);
    persistSession(response.data.data);
    return response.data.data;
  };

  const logout = async () => {
    try {
      if (session?.refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken: session.refreshToken });
      }
    } finally {
      clearSession();
    }
  };

  const refreshProfile = async () => {
    const response = await axiosInstance.get('/users/profile');
    const data = response.data.data;
    const currentSession = getStoredSession() || {};

    persistSession({
      ...currentSession,
      user: data.user,
      roles: data.roles,
      permissions: data.permissions
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
    bindAuthStore({
      getAccessToken: () => getStoredSession()?.accessToken || null,
      getRefreshToken: () => getStoredSession()?.refreshToken || null,
      updateSession,
      clearSession
    });
    setIsLoading(false);
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        roles: session?.roles || [],
        permissions: session?.permissions || [],
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
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
