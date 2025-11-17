import React, { createContext, useState, useEffect } from 'react';
import { fetchMe } from '../api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  // Store role preference per tab using sessionStorage
  const [rolePreference, setRolePreference] = useState(() => {
    const saved = sessionStorage.getItem('rolePreference');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) {
      refreshUser(); // load user when token exists
    }
  }, [token]);

  // Persist role preference to sessionStorage whenever it changes
  useEffect(() => {
    if (rolePreference !== null) {
      sessionStorage.setItem('rolePreference', JSON.stringify(rolePreference));
    }
  }, [rolePreference]);

  const login = (token, userData, isTeacher = null) => {
    setToken(token);
    localStorage.setItem('token', token);
    setUser(userData);
    // Store which role the user is logging in as for this tab
    if (isTeacher !== null) {
      setRolePreference(isTeacher);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('rolePreference');
    setRolePreference(null);
  };

  // ✅ new function to refresh user data from /me
  const refreshUser = async () => {
    if (!token) return;
    try {
      const data = await fetchMe(token);
      setUser(data);
    } catch (err) {
      // Only logout if it's an authorization error (401/403)
      // Don't logout on temporary network errors or other issues
      if (err.message.includes('401') || err.message.includes('403')) {
        console.error('Auth token invalid, logging out:', err.message);
        logout();
      } else {
        console.error('Failed to refresh user:', err.message);
        // Keep user logged in even if refresh fails temporarily
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, rolePreference, setRolePreference }}>
      {children}
    </AuthContext.Provider>
  );
};
