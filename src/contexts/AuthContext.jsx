import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('adminUser');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('adminUser', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('adminUser');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = (username, password) => {
    // Simple authentication (in production, use proper backend authentication)
    if (username === 'admin' && password === 'admin@123') {
      const userData = {
        username,
        role: 'admin',
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

