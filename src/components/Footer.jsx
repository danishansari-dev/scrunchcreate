import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const instagramImages = [
  '/assets/products/scrunchie/classic/brown/sc-scrunchie-classic-brown-1.webp',
  '/assets/products/hairbow/satin/black/sc-hairbow-satin-black-1.webp',
  '/assets/products/gifthamper/sc-gifthamper-1.webp',
  '/assets/products/flowerjewellery/rose/yellow/sc-flowerjewellery-rose-yellow-1.webp'
]

/**
 * Renders the store footer with newsletter, navigation, trust links, and social proof.
 * @returns Site footer
 */
export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), [])
  const [email, setEmail] = useState('')

  const handleSubscribe = (event) => {
    event.preventDefault()
    if (email.trim()) {
      alert('Thank you for subscribing!')
      setEmail('')
    }
  }

  return (
    <footer className={styles.footer}>
      <section className={styles.newsletterBand} aria-labelledby="footer-newsletter-title">
        <div className={styles.newsletterCopy}>
          <p className={styles.eyebrow}>Scrunch & Create</p>
          <h2 id="footer-newsletter-title">Handmade drops, styling notes, and gift-ready offers.</h2>
        </div>
        <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
          <label className={styles.inputLabel} htmlFor="footer-email">Email address</label>
          <input
            id="footer-email"
            type="email"
            placeholder="Email address"
            className={styles.newsletterInput}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit" className={styles.subscribeBtn}>Subscribe</button>
        </form>
      </section>

      <section className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.brandSection}>
            <Link to="/" className={styles.brand}>Scrunch &amp; Create</Link>
            <p className={styles.address}>
              Premium handmade hair accessories crafted in India for everyday polish, gifting, and occasion styling.
            </p>
            <div className={styles.contactStack}>
              <a href="tel:+917300969491" className={styles.contactLink}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +91 73009 69491
              </a>
              <a href="mailto:scrunchcreate@gmail.com" className={styles.contactLink}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                scrunchcreate@gmail.com
              </a>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Shop</h3>
            <ul className={styles.linkList}>
              <li><Link to="/products" className={styles.link}>All Products</Link></li>
              <li><Link to="/products/scrunchies" className={styles.link}>Scrunchies</Link></li>
              <li><Link to="/products/hair-bows" className={styles.link}>Hair Bows</Link></li>
              <li><Link to="/products/hamper" className={styles.link}>Gift Hampers</Link></li>
              <li><Link to="/products/flower-jewellery" className={styles.link}>Flower Jewellery</Link></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Policies</h3>
            <ul className={styles.linkList}>
              <li><Link to="/privacy-policy" className={styles.link}>Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className={styles.link}>Terms &amp; Conditions</Link></li>
              <li><Link to="/refund-policy" className={styles.link}>Refund Policy</Link></li>
              <li><a href="https://wa.me/917300969491" className={styles.link} target="_blank" rel="noopener noreferrer">Order Support</a></li>
            </ul>
          </div>

          <div className={styles.instagramSection}>
            <div className={styles.instagramHeader}>
              <h3 className={styles.sectionTitle}>Instagram</h3>
              <a
                className={styles.instagramHandle}
                href="https://www.instagram.com/scrunch_and_create"
                target="_blank"
                rel="noopener noreferrer"
              >
                @scrunch_and_create
              </a>
            </div>
            <div className={styles.instagramGrid}>
              {instagramImages.map((src) => (
                <a
                  key={src}
                  href="https://www.instagram.com/scrunch_and_create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.instagramTile}
                  aria-label="Open Scrunch and Create on Instagram"
                >
                  <img src={src} alt="" loading="lazy" />
                </a>
              ))}
            </div>
            <div className={styles.socials} aria-label="Social links">
              <a className={styles.socialLink} href="https://www.instagram.com/scrunch_and_create" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a className={styles.socialLink} href="https://www.facebook.com/people/Scrunch-Create/61562141818887/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                </svg>
              </a>
              <a className={styles.socialLink} href="https://www.pinterest.com/@scrunch_and_create" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                </svg>
              </a>
              <a className={styles.socialLink} href="https://wa.me/917300969491" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.bottom}>
        <span>&copy; {year} Scrunch &amp; Create. All rights reserved.</span>
        <span>Made in India</span>
      </section>
    </footer>
  )
}
