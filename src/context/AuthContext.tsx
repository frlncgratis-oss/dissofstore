import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../types';

const DEFAULT_ADMIN_USER = 'admin';
const DEFAULT_ADMIN_PASS = 'dissof2026!';
const TOKEN_KEY = 'dissof_admin_token';
const USER_KEY = 'dissof_admin_user';
const CUSTOM_PASS_KEY = 'dissof_admin_custom_password';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedUser && savedToken) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const checkAuth = useCallback(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken);
      } catch {
        const defaultUser: AdminUser = {
          id: 'admin-1',
          username: 'admin',
          name: 'Dissof Admin',
          role: 'admin',
        };
        setUser(defaultUser);
        setToken(savedToken);
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const inputUser = credentials.username.trim().toLowerCase();
      const inputPass = credentials.password.trim();

      // Retrieve current valid password (either customized or default)
      const validPassword = localStorage.getItem(CUSTOM_PASS_KEY) || DEFAULT_ADMIN_PASS;

      if (inputUser === DEFAULT_ADMIN_USER && inputPass === validPassword) {
        const adminUserData: AdminUser = {
          id: 'admin-1',
          username: 'admin',
          name: 'Dissof Admin',
          role: 'admin',
        };
        const authToken = `dissof_admin_auth_${Date.now()}`;

        localStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(adminUserData));

        setToken(authToken);
        setUser(adminUserData);
      } else {
        throw new Error('Username atau password salah. Gunakan username "admin" dan password "dissof2026!".');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
