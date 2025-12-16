import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';
import { useCart } from '../components/CartContext';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { totalItems } = useCart();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <button 
          className={styles.menuButton} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12h18M3 6h18M3 18h18"></path>
          </svg>
        </button>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandText}>Scrunch &amp; Create</span>
        </Link>
        
        <nav className={styles.nav}>
          <ul className={styles.navLinks}>
            <li><Link to="/products">Shop All</Link></li>
            <li><Link to="/products/hair-bows">HAIR BOWS</Link></li>
            <li><Link to="/products/scrunchies">Scrunchies</Link></li>
            <li><Link to="/products/kids">KIDS</Link></li>
            <li><Link to="/best sellers">BEST SELLERS</Link></li>
            <li><Link to="/gifting">GIFTING</Link></li>
          </ul>
        </nav>
        
        <div className={styles.utilityLinks}>
          <button aria-label="Search" className={styles.iconButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
          <a href="#wishlist" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </a>
          {isAuthenticated ? (
            <>
              <Link to="/profile" aria-label="Account" title={currentUser?.name || 'Account'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
              <button 
                onClick={handleLogout} 
                aria-label="Logout" 
                className={styles.iconButton}
                title="Logout"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </>
          ) : (
            <Link to="/signin" aria-label="Sign In" title="Sign In">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          )}
          <Link to="/cart" className={styles.cartBadge} aria-label="Shopping cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className={styles.cartCount}>{totalItems}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
