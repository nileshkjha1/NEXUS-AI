import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(api.getUser());
  const [token, setToken] = useState(api.getToken());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = api.getToken();
      if (storedToken) {
        try {
          const freshUser = await api.getMe();
          setUser(freshUser);
        } catch (err) {
          console.error('Session initialization failed:', err);
          api.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    setUser(response.user);
    setToken(response.access_token);
    return response.user;
  };

  const register = async (userData) => {
    return await api.register(userData);
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    role: user?.role,
    isEmployee: user?.role === 'Employee',
    isAgent: user?.role === 'IT Support Agent',
    isAdmin: user?.role === 'Administrator',
    loading,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    closeSidebar,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

