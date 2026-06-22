/**
 * Why this file exists:
 * Centralizes all coupon/discount definitions so they can be validated
 * against cart subtotals. Hardcoded config approach chosen over database
 * for simplicity — can be migrated to Supabase/API later.
 */

export const FREE_SHIPPING_THRESHOLD = 499

/**
 * Coupon definitions
 * @type {Object.<string, CouponConfig>}
 *
 * Types:
 *   - 'percentage': Applies value% off subtotal, capped at maxDiscount
 *   - 'fixed': Flat ₹ amount off subtotal
 *   - 'freeShipping': Waives delivery fee regardless of subtotal
 */
export const COUPONS = {
  WELCOME10: {
    type: 'percentage',
    value: 10,
    minOrder: 199,
    maxDiscount: 100,
    label: '10% off your first order',
    description: 'Get 10% off on orders above ₹199',
  },
  FESTIVE20: {
    type: 'percentage',
    value: 20,
    minOrder: 499,
    maxDiscount: 200,
    label: '20% off festive collection',
    description: 'Get 20% off on orders above ₹499',
  },
  FLAT50: {
    type: 'fixed',
    value: 50,
    minOrder: 299,
    maxDiscount: 50,
    label: '₹50 off',
    description: 'Flat ₹50 off on orders above ₹299',
  },
  FREESHIP: {
    type: 'freeShipping',
    value: 0,
    minOrder: 0,
    maxDiscount: 49, // Equals the standard delivery fee
    label: 'Free shipping',
    description: 'Free delivery on any order',
  },
}

/** Standard delivery fee when subtotal is below the free shipping threshold */
export const DELIVERY_FEE = 49
