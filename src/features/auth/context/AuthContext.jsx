/* eslint-disable react-refresh/only-export-components */
// Why: AuthContext exports both AuthProvider and useAuth hook, triggering react-refresh warnings.
/**
 * Why this file exists:
 * Manages the global authentication state of the user using Supabase Auth.
 * Enables reactive access to the logged-in user details, active session, and handles
 * credentials submission, logouts, and post-authentication routines like cart merging.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../shared/config/supabase';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  mergeGuestCartIntoUserCart,
  mergeGuestWishlistIntoUserWishlist,
} from '../../../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the app and initializes auth listeners.
 * @danishansari-dev children - React children elements to wrap
 * @returns React context provider wrapping the application
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Safe wrapper around session retrieval
   * Why: Used to populate the initial user state on mount before listener fires.
   */
  const initializeAuth = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session: activeSession }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (activeSession) {
        setSession(activeSession);
        // Get the verified user details from supabase
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        // Ensure email is in localstorage for synchronous cart queries
        if (currentUser?.email) {
          localStorage.setItem('scrunch_current_user_email', currentUser.email);
        }
      }
    } catch (err) {
      console.error('[AuthContext] Initial session resolution failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for session and auth changes from Supabase Auth
  useEffect(() => {
    initializeAuth();

    if (!supabase) return;

    // Tricky logic: onAuthStateChange handles sign-ins, sign-outs, and token refreshes.
    // If a SIGNED_IN event occurs, we want to update state, sync the local storage cache,
    // and merge the guest cart + wishlist into the user-specific database.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, activeSession) => {
      setSession(activeSession);
      
      if (activeSession?.user) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser?.email) {
          localStorage.setItem('scrunch_current_user_email', currentUser.email);
          // Auto-merge cart and wishlist items when logging in or signing up
          await mergeGuestCartIntoUserCart(currentUser.email);
          await mergeGuestWishlistIntoUserWishlist();
        }
      } else {
        setUser(null);
        localStorage.removeItem('scrunch_current_user_email');
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  /**
   * Action to log in a user using email and password
   * @danishansari-dev email - User's email address
   * @danishansari-dev password - User's password
   * @returns {Promise<boolean>} Resolves to true if login succeeded
   */
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      await apiLogin(email, password);
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Login failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action to register a new user
   * @danishansari-dev name - User's full name
   * @danishansari-dev email - User's unique email address
   * @danishansari-dev password - User's password
   * @returns {Promise<boolean>} Resolves to true if registration succeeded
   */
  const signUp = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      await apiRegister(name, email, password);
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Signup failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Action to terminate the current session
   */
  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch (err) {
      console.error('[AuthContext] Logout failed:', err.message);
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  /**
   * Clears any active authentication errors
   */
  const clearAuthError = () => setAuthError(null);

  const value = {
    user,
    session,
    loading,
    authError,
    login,
    signUp,
    logout,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to consume AuthContext capabilities in components
 * @returns Global authentication states and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
