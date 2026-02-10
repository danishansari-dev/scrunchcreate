import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';
import { useCart } from '../components/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../utils/getProducts';
import { useWishlist } from '../context/WishlistContext';

// Map category names to URL slugs
const categoryToSlug = {
  'HairBow': 'hair-bows',
  'Scrunchie': 'scrunchies',
  'Combo': 'combo',
  'Earring': 'earings',
  'GiftHamper': 'hamper',
  'Paraandi': 'paraandi',
  'FlowerJewellery': 'flower-jewellery'
};

// Friendly display names
const categoryDisplayNames = {
  'HairBow': 'Hair Bows',
  'Scrunchie': 'Scrunchies',
  'Combo': 'Combo',
  'Earring': 'Earrings',
  'GiftHamper': 'Hamper',
  'Paraandi': 'Paraandi',
  'FlowerJewellery': 'Flower Jewellery'
};

// Categories to show in navbar with dropdowns
const navCategories = ['HairBow', 'Scrunchie', 'GiftHamper', 'FlowerJewellery'];

const NavBar = () => {
  const { totalItems, toggleCart } = useCart();
  const { wishlist } = useWishlist();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get all products and derive categories with their types and colors
  const categoryData = useMemo(() => {
    const products = getProducts();
    const data = {};

    navCategories.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat);

      // Group by Type
      const typeGroups = {};

      catProducts.forEach(p => {
        const type = p.type || 'Standard'; // Fallback for products without type
        if (!typeGroups[type]) {
          typeGroups[type] = {
            name: type,
            colors: new Set(),
            count: 0
          };
        }
        typeGroups[type].count++;
        if (p.availableColors && Array.isArray(p.availableColors)) {
          p.availableColors.forEach(c => typeGroups[type].colors.add(c));
        } else if (p.normalizedColor || p.color) {
          typeGroups[type].colors.add(p.normalizedColor || p.color);
        }
      });

      // Convert Sets to Arrays and sort
      const types = Object.values(typeGroups).map(group => ({
        ...group,
        colors: Array.from(group.colors).sort()
      })).sort((a, b) => b.count - a.count); // Sort types by product count desc

      data[cat] = {
        types,
        count: catProducts.length
      };
    });

    return data;
  }, []);

  const handleMouseEnter = (category) => {
    setActiveDropdown(category);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const handleKeyDown = (e, category) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveDropdown(activeDropdown === category ? null : category);
    } else if (e.key === 'Escape') {
      setActiveDropdown(null);
    }
  };

  const handleSearchToggle = () => {
    if (searchOpen && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    } else {
      setSearchOpen(!searchOpen);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
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
            <li><Link to="/products">Shop</Link></li>

            {navCategories.map(category => {
              const slug = categoryToSlug[category];
              const displayName = categoryDisplayNames[category];
              const data = categoryData[category];
              const hasSubcategories = data && data.types.length > 0;

              return (
                <li
                  key={category}
                  className={styles.navItem}
                  onMouseEnter={() => handleMouseEnter(category)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={`/products/${slug}`}
                    className={styles.navLink}
                    onKeyDown={(e) => handleKeyDown(e, category)}
                    aria-haspopup={hasSubcategories ? 'true' : undefined}
                    aria-expanded={activeDropdown === category ? 'true' : undefined}
                  >
                    {displayName}
                    {hasSubcategories && (
                      <svg className={styles.dropdownIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    )}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {hasSubcategories && activeDropdown === category && (
                    <div className={styles.dropdown}>
                      <div className={styles.megaMenuContent}>
                        {data.types.map(typeGroup => (
                          <div key={typeGroup.name} className={styles.megaMenuColumn}>
                            <Link
                              to={`/products/${slug}?type=${encodeURIComponent(typeGroup.name)}`}
                              className={styles.megaMenuHeading}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {typeGroup.name}
                            </Link>
                            <ul className={styles.megaMenuList}>
                              {typeGroup.colors.slice(0, 5).map(color => (
                                <li key={color}>
                                  <Link
                                    to={`/products/${slug}?type=${encodeURIComponent(typeGroup.name)}&color=${encodeURIComponent(color)}`}
                                    className={styles.megaMenuLink}
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    {color.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Link>
                                </li>
                              ))}
                              {typeGroup.colors.length > 5 && (
                                <li>
                                  <Link
                                    to={`/products/${slug}?type=${encodeURIComponent(typeGroup.name)}`}
                                    className={styles.megaMenuViewAll}
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    View all {typeGroup.colors.length} colors →
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.utilityLinks}>
          <div className={`${styles.searchWrapper} ${searchOpen ? styles.searchOpen : ''}`}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search products"
            />
            <button
              aria-label={searchOpen ? 'Submit search' : 'Open search'}
              className={styles.iconButton}
              onClick={handleSearchToggle}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
          <Link to="/wishlist" aria-label="Wishlist" className={styles.cartBadge}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlist.length > 0 && <span className={styles.cartCount}>{wishlist.length}</span>}
          </Link>
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
          <button onClick={toggleCart} className={styles.cartBadge} aria-label="Shopping cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className={styles.cartCount}>{totalItems}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;

