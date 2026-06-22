/**
 * Why this file exists:
 * Encapsulates coupon validation so both CartContext and the checkout page
 * can verify codes without duplicating business rules.
 */

import { COUPONS, DELIVERY_FEE, FREE_SHIPPING_THRESHOLD } from '../config/coupons'

/**
 * Validates a coupon code against the current subtotal
 * @param {string} code - The raw coupon code entered by the user
 * @param {number} subtotal - Cart subtotal before discounts
 * @returns {{ valid: boolean, discount: number, coupon: object|null, error: string|null }}
 */
export function validateCoupon(code, subtotal) {
  if (!code || typeof code !== 'string') {
    return { valid: false, discount: 0, coupon: null, error: 'Please enter a coupon code' }
  }

  // Normalize: trim whitespace, strip hyphens, uppercase for case-insensitive match
  const normalized = code.trim().replace(/-/g, '').toUpperCase()

  const coupon = COUPONS[normalized]
  if (!coupon) {
    return { valid: false, discount: 0, coupon: null, error: 'Invalid coupon code' }
  }

  // Check minimum order requirement
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      discount: 0,
      coupon: null,
      error: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
    }
  }

  // Calculate discount based on coupon type
  let discount = 0

  switch (coupon.type) {
    case 'percentage':
      discount = Math.round((subtotal * coupon.value) / 100)
      // Cap at max discount
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
      break

    case 'fixed':
      discount = coupon.value
      // Don't let discount exceed subtotal
      if (discount > subtotal) {
        discount = subtotal
      }
      break

    case 'freeShipping':
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        return {
          valid: false,
          discount: 0,
          coupon: null,
          error: 'You already qualify for FREE shipping on this order!',
        }
      }
      discount = DELIVERY_FEE
      break

    default:
      return { valid: false, discount: 0, coupon: null, error: 'Unknown coupon type' }
  }

  return {
    valid: true,
    discount,
    coupon: { ...coupon, code: normalized },
    error: null,
  }
}

/**
 * Calculates delivery fee based on subtotal and applied coupon
 * @param {number} subtotal - Cart subtotal
 * @param {object|null} appliedCoupon - Currently applied coupon
 * @returns {number} Delivery fee in ₹
 */
export function calculateDeliveryFee(subtotal, appliedCoupon) {
  // Free shipping if above threshold
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  // Free shipping coupon applied
  if (appliedCoupon && appliedCoupon.type === 'freeShipping') return 0
  return DELIVERY_FEE
}
