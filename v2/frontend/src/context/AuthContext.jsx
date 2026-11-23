import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      authApi.me()
        .then((userData) => {
          setUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    sessionStorage.setItem('access_token', data.accessToken);
    const userInfo = {
      userId: data.userId,
      username: data.username,
      role: data.role,
      hubId: data.hubId
    };
    setUser(userInfo);
    sessionStorage.setItem('user', JSON.stringify(userInfo));
    return userInfo;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
