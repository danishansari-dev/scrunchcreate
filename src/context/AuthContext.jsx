/**
 * Auth context providing centralized state for the currently logged in user.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import api from '../services/api'; // raw api to fetch 'me'

import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read from local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Validate token and fetch user details
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.data);
          setError(null); // Clear any previous errors on success
        })
        .catch((err) => {
          console.error('Initial auth fetch failed', err);

          // Differentiate between network errors and 401 errors
          const isNetworkError = !err.response || err.code === 'ERR_NETWORK';
          const is401Error = err.response && err.response.status === 401;

          if (is401Error) {
            // Invalid/expired token - clear session
            logout();
          } else if (isNetworkError) {
            // Network error - preserve session and set error message
            setError('Failed to connect to server');
          } else {
            // Other errors - set error message but preserve session
            setError('Failed to connect to server');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    setToken(res.token);
    setUser(res.data);
    localStorage.setItem('token', res.token);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await apiRegister(name, email, password);
    setToken(res.token);
    setUser(res.data);
    localStorage.setItem('token', res.token);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const retryConnection = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Retry auth fetch failed', err);
      const isNetworkError = !err.response || err.code === 'ERR_NETWORK';
      const is401Error = err.response && err.response.status === 401;

      if (is401Error) {
        logout();
      } else {
        setError('Failed to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '12px 16px',
          margin: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <strong style={{ color: '#c33' }}>Connection Error</strong>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>
              Unable to connect to server. Please check your internet connection and try again.
            </p>
          </div>
          <button
            onClick={retryConnection}
            style={{
              backgroundColor: '#c33',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#a22'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#c33'}
          >
            Retry
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};
