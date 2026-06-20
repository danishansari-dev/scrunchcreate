import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useToast } from '../../components/ToastContext';
import styles from './AuthPage.module.css';

/**
 * Why this file exists:
 * The single, dedicated storefront entry point for both registration and login.
 * Replaces the mock plain-text login/registration forms with a gorgeous, high-fidelity,
 * fully-validated authentication screen utilizing Supabase Auth and native CSS transitions.
 */
export default function AuthPage() {
  const { user, login, signUp, authError, clearAuthError, loading } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab switching state: 'login' or 'signup'
  const [activeTab, setActiveTab] = useState('login');

  // Input fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  // Where to send the user after successful login
  const from = location.state?.from?.pathname || '/profile';

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Clear auth context errors when switching tabs
  useEffect(() => {
    clearAuthError();
    setErrors({});
  }, [activeTab, clearAuthError]);

  /**
   * Performs basic email and password validation
   * @returns {boolean} Whether the inputs are valid
   */
  const validateForm = () => {
    const tempErrors = {};
    if (activeTab === 'signup' && !name.trim()) {
      tempErrors.name = 'Full name is required';
    }
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  /**
   * Handles form submission for both Sign In and Sign Up tabs
   * @danishansari-dev e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      triggerShake();
      return;
    }

    if (activeTab === 'login') {
      const success = await login(email, password);
      if (success) {
        show('Welcome back! Successfully logged in.', 'success');
      } else {
        triggerShake();
      }
    } else {
      const success = await signUp(name, email, password);
      if (success) {
        show('Registration successful! Welcome to Scrunch & Create.', 'success');
      } else {
        triggerShake();
      }
    }
  };

  /**
   * Triggers a visual shaking animation on validation/API failure
   */
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <main className={styles.page}>
      <div className={`${styles.container} ${shake ? styles.shake : ''}`}>
        
        {/* Left Side: Brand Imagery/Slogan */}
        <div className={styles.brandHero}>
          <div className={styles.brandHeroOverlay} />
          <div className={styles.brandHeroContent}>
            <h2 className={styles.brandTitle}>Elevate Your Everyday Style</h2>
            <p className={styles.brandText}>
              Discover premium, handcrafted silk hair bows, organza scrunchies, 
              and accessories designed to make you feel beautiful every single day.
            </p>
            <div className={styles.brandBadges}>
              <span>✨ 100% Handcrafted</span>
              <span>💝 Silk & Velvet</span>
              <span>🔒 Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Auth Forms */}
        <div className={styles.formSection}>
          <div className={styles.tabsHeader}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'login' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'signup' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h3 className={styles.formHeading}>
              {activeTab === 'login' ? 'Welcome Back!' : 'Create An Account'}
            </h3>
            <p className={styles.formSubheading}>
              {activeTab === 'login' 
                ? 'Sign in to access your saved wishlist and view order updates.' 
                : 'Join us to track orders, receive promotional discounts, and check out faster.'
              }
            </p>

            {/* API / Context Level Error Messages */}
            {authError && (
              <div className={styles.alertError}>
                <span className={styles.alertIcon}>⚠️</span>
                <span className={styles.alertText}>{authError}</span>
              </div>
            )}

            {/* Field: Full Name (Visible only during registration) */}
            {activeTab === 'signup' && (
              <div className={`${styles.fieldGroup} ${errors.name ? styles.fieldHasError : ''}`}>
                <div className={styles.inputWrapper}>
                  <input
                    id="reg-name"
                    type="text"
                    className={`${styles.input} ${name ? styles.inputFilled : ''}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                  <label htmlFor="reg-name" className={styles.label}>Full Name</label>
                </div>
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>
            )}

            {/* Field: Email */}
            <div className={`${styles.fieldGroup} ${errors.email ? styles.fieldHasError : ''}`}>
              <div className={styles.inputWrapper}>
                <input
                  id="auth-email"
                  type="email"
                  className={`${styles.input} ${email ? styles.inputFilled : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <label htmlFor="auth-email" className={styles.label}>Email Address</label>
              </div>
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            {/* Field: Password */}
            <div className={`${styles.fieldGroup} ${errors.password ? styles.fieldHasError : ''}`}>
              <div className={styles.inputWrapper}>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${password ? styles.inputFilled : ''} ${styles.inputPassword}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <label htmlFor="auth-password" className={styles.label}>Password</label>
                
                {/* Eyeball Password Toggle Icon */}
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : activeTab === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
