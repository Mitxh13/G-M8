import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { fetchMe } from '../api.js';

const PrivateRoute = ({ children }) => {
  const { token, user, login, logout } = useContext(AuthContext);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      try {
        const data = await fetchMe(token);
        login(token, data); // refresh user info
        setAuthorized(true);
      } catch (err) {
        // Only logout if it's a clear authorization error
        // Don't logout on temporary network errors
        if (err.message.includes('401') || err.message.includes('403') || err.message.includes('unauthorized')) {
          logout();
          setAuthorized(false);
        } else {
          // For other errors, still allow access if we have a token
          // User can continue working; just user data might be stale
          console.warn('Could not verify token:', err.message);
          setAuthorized(true);
        }
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  if (checking) {
    return (
      <div
        style={{
          color: 'white',
          background: 'black',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1rem',
        }}
      >
        Checking authentication...
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
