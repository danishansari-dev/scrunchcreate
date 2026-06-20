/**
 * Why this file exists:
 * Collapsed coupon field that prevents "coupon hunting" abandonment.
 * Follows Baymard Institute best practice: hidden by default behind
 * a "Have a promo code?" link, expanding only when clicked.
 */
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import styles from './CouponField.module.css'

export default function CouponField() {
  const { appliedCoupon, couponDiscount, couponError, applyCoupon, removeCoupon } = useCart()
  const [isExpanded, setIsExpanded] = useState(false)
  const [code, setCode] = useState('')

  const handleApply = () => {
    if (!code.trim()) return
    const result = applyCoupon(code)
    if (result.success) {
      setCode('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApply()
    }
  }

  // Show applied coupon state
  if (appliedCoupon) {
    return (
      <div className={styles.applied}>
        <div className={styles.appliedInfo}>
          <span className={styles.appliedIcon}>🏷️</span>
          <div>
            <div className={styles.appliedCode}>{appliedCoupon.code}</div>
            <div className={styles.appliedSavings}>You save ₹{couponDiscount.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <button
          className={styles.removeBtn}
          onClick={removeCoupon}
          aria-label="Remove coupon"
        >
          ✕
        </button>
      </div>
    )
  }

  // Collapsed state: just a link
  if (!isExpanded) {
    return (
      <button
        className={styles.toggleBtn}
        onClick={() => setIsExpanded(true)}
        type="button"
      >
        🏷️ Have a promo code?
      </button>
    )
  }

  // Expanded state: input + apply button
  return (
    <div className={styles.field}>
      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter code"
          aria-label="Coupon code"
          autoFocus
        />
        <button
          className={styles.applyBtn}
          onClick={handleApply}
          disabled={!code.trim()}
          type="button"
        >
          Apply
        </button>
      </div>
      {couponError && (
        <div className={styles.error}>{couponError}</div>
      )}
    </div>
  )
}
