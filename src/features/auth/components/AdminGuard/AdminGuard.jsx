/**
 * Why this file exists:
 * Route protection wrapper for administrative pages.
 * Prevents unauthorized users and guests from rendering admin panel views
 * and accessing admin dashboard controls.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isUserAdmin } from '../../../../shared/config/adminConfig';

/**
 * AdminGuard component checks user status and restricts children rendering.
 * Why: Secures route boundaries in the React client.
 * Tricky logic: Standard users are shown a glassmorphic Access Denied screen instead of a raw redirect
 * to inform them of their insufficient permissions.
 * @danishansari-dev props - React children to secure
 * @returns Secured children or Access Denied UI
 */
export function AdminGuard({ children }) {
  const { user, loading } = useAuth();


  // Glassmorphic Access Denied component inline styles to keep it fully self-contained
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '24px',
    fontFamily: 'var(--font-body, inherit)',
    background: 'radial-gradient(circle at top left, rgba(74, 28, 64, 0.05), transparent 40%)',
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 20px 40px rgba(74, 28, 64, 0.06)',
    borderRadius: 'var(--radius-lg, 16px)',
    padding: '40px 32px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
  };

  const iconWrapperStyle = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(210, 0, 0, 0.08)',
    color: 'var(--color-error, #d20000)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  };

  const buttonStyle = {
    display: 'inline-block',
    background: 'var(--color-primary, #e78592)',
    color: 'var(--color-on-primary, #ffffff)',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md, 8px)',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    marginTop: '24px',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, padding: '60px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(231, 133, 146, 0.2)',
            borderTopColor: 'var(--color-primary, #e78592)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Guest users are redirected to login immediately
  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={iconWrapperStyle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 style={{ color: 'var(--color-secondary)', marginBottom: '8px', fontSize: '20px' }}>Authentication Required</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
            Please sign in with an administrator account to access this page.
          </p>
          <Link to="/login" style={buttonStyle}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated but non-admin users see access denied
  if (!isUserAdmin(user)) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={iconWrapperStyle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 style={{ color: 'var(--color-secondary)', marginBottom: '8px', fontSize: '20px' }}>Access Denied</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
            You do not have the required permissions to view the administration panel.
          </p>
          <Link to="/" style={buttonStyle}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
