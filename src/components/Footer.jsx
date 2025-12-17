import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), [])
  
  return (
    <footer className={styles.footer}>
      <section className={styles.main}>
        <div className={styles.grid}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <Link to="/" className={styles.brand}>Scrunch & Create</Link>
            <p className={styles.description}>
              Premium handmade hair accessories crafted with love.<br />
              Designed in India for effortless, everyday elegance.
            </p>
            <a href="mailto:scrunchcreate@gmail.com" className={styles.email}>
              scrunchcreate@gmail.com
            </a>
          </div>

          {/* Trust & Assurance Section */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Trust & Assurance</h4>
            <ul className={styles.trustList}>
              <li className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Handmade Products</span>
              </li>
              <li className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Made in India</span>
              </li>
              <li className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Cash on Delivery Available</span>
              </li>
              <li className={styles.trustItem}>
                <span className={styles.trustIcon}>✓</span>
                <span>Quality-Checked Materials</span>
              </li>
            </ul>
          </div>

          {/* Social & Community Section */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Connect With Us</h4>
            <div className={styles.socials}>
              <a 
                className={styles.socialLink} 
                href="https://www.instagram.com/scrunch_and_create" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram" 
                title="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                </svg>
              </a>
              <a 
                className={styles.socialLink} 
                href="https://www.facebook.com/people/Scrunch-Create/61562141818887/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook" 
                title="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                </svg>
              </a>
              <a 
                className={styles.socialLink} 
                href="https://www.pinterest.com/@scrunch_and_create" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Pinterest" 
                title="Pinterest"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                </svg>
              </a>
              <a 
                className={styles.socialLink} 
                href="https://www.youtube.com/@scrunch_and_create" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube" 
                title="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* WhatsApp CTA Section */}
          <div className={styles.ctaSection}>
            <div className={styles.ctaBlock}>
              <p className={styles.ctaText}>Not sure which style suits you best?</p>
              <a 
                href="https://wa.me/918979956075" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.ctaButton}
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className={styles.bottom}>
        <div className={styles.bottomInner}>
          <div className={styles.bottomLeft}>
            <span className={styles.copy}>© {year} Scrunch & Create. All rights reserved.</span>
            <span className={styles.trustReminder}>Handmade in India • Cash on Delivery Available</span>
          </div>
          <nav className={styles.bottomLinks} aria-label="Legal">
            <Link to="/privacy-policy" className={styles.bottomLink}>Privacy Policy</Link>
            <Link to="/terms-and-conditions" className={styles.bottomLink}>Terms & Conditions</Link>
          </nav>
        </div>
      </section>
    </footer>
  )
}
