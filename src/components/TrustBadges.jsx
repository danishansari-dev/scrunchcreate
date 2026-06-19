/**
 * Why this file exists:
 * Trust badges reduce payment anxiety at the checkout stage.
 * Placed near the "Place Order" button per Baymard Institute recommendation.
 */
import styles from './TrustBadges.module.css'

/**
 * Trust badges component for checkout and cart
 * @param {object} props
 * @param {boolean} props.compact - If true, shows a single-line compact version
 */
export default function TrustBadges({ compact = false }) {
  if (compact) {
    return (
      <div className={styles.compactRow}>
        <span className={styles.compactBadge}>🔒 Secure Checkout</span>
        <span className={styles.compactDivider}>•</span>
        <span className={styles.compactBadge}>✅ 100% Genuine</span>
        <span className={styles.compactDivider}>•</span>
        <span className={styles.compactBadge}>📦 Easy Returns</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.badges}>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>🔒</span>
          <div>
            <div className={styles.badgeTitle}>Secure Checkout</div>
            <div className={styles.badgeDesc}>SSL encrypted payment</div>
          </div>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>✅</span>
          <div>
            <div className={styles.badgeTitle}>100% Handmade</div>
            <div className={styles.badgeDesc}>Genuine & quality checked</div>
          </div>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>📦</span>
          <div>
            <div className={styles.badgeTitle}>Easy Returns</div>
            <div className={styles.badgeDesc}>Hassle-free returns</div>
          </div>
        </div>
      </div>
      <div className={styles.paymentIcons}>
        <span className={styles.paymentIcon} title="Visa">💳</span>
        <span className={styles.paymentIcon} title="Mastercard">💳</span>
        <span className={styles.paymentIcon} title="UPI">📱</span>
        <span className={styles.paymentIcon} title="Cash on Delivery">💵</span>
      </div>
    </div>
  )
}
