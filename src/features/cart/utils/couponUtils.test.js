import { describe, expect, it } from 'vitest'
import { validateCoupon, calculateDeliveryFee } from './couponUtils'
import { DELIVERY_FEE, FREE_SHIPPING_THRESHOLD } from '../config/coupons'

describe('validateCoupon', () => {
  it('rejects empty or non-string coupon codes', () => {
    expect(validateCoupon('', 500)).toMatchObject({
      valid: false,
      error: 'Please enter a coupon code',
    })
    expect(validateCoupon(null, 500)).toMatchObject({
      valid: false,
      error: 'Please enter a coupon code',
    })
  })

  it('rejects invalid coupon codes', () => {
    expect(validateCoupon('NOTREAL', 500)).toMatchObject({
      valid: false,
      error: 'Invalid coupon code',
    })
  })

  it('applies percentage discount capped at maxDiscount', () => {
    const uncapped = validateCoupon('WELCOME10', 300)
    expect(uncapped.valid).toBe(true)
    expect(uncapped.discount).toBe(30)

    const capped = validateCoupon('WELCOME10', 1000)
    expect(capped.valid).toBe(true)
    expect(capped.discount).toBe(100)
    expect(capped.coupon.code).toBe('WELCOME10')
  })

  it('rejects percentage coupon when subtotal is below minOrder', () => {
    const result = validateCoupon('WELCOME10', 100)

    expect(result.valid).toBe(false)
    expect(result.error).toContain('Minimum order')
  })

  it('applies fixed discount without exceeding subtotal', () => {
    const result = validateCoupon('FLAT50', 400)

    expect(result.valid).toBe(true)
    expect(result.discount).toBe(50)
  })

  it('normalizes coupon codes with hyphens and mixed case', () => {
    const result = validateCoupon('free-ship', 200)

    expect(result.valid).toBe(true)
    expect(result.discount).toBe(DELIVERY_FEE)
    expect(result.coupon.code).toBe('FREESHIP')
  })

  it('rejects free shipping coupon when order already qualifies for free shipping', () => {
    const atThreshold = validateCoupon('FREESHIP', FREE_SHIPPING_THRESHOLD)
    expect(atThreshold.valid).toBe(false)
    expect(atThreshold.error).toBe('You already qualify for FREE shipping on this order!')
    expect(atThreshold.discount).toBe(0)

    const aboveThreshold = validateCoupon('FREESHIP', 750)
    expect(aboveThreshold.valid).toBe(false)
    expect(aboveThreshold.error).toBe('You already qualify for FREE shipping on this order!')
  })

  it('waives delivery fee via free shipping coupon below threshold', () => {
    const result = validateCoupon('FREESHIP', FREE_SHIPPING_THRESHOLD - 1)

    expect(result.valid).toBe(true)
    expect(result.discount).toBe(DELIVERY_FEE)
    expect(result.coupon.type).toBe('freeShipping')
  })
})

describe('calculateDeliveryFee', () => {
  it('returns zero when subtotal meets free shipping threshold', () => {
    expect(calculateDeliveryFee(FREE_SHIPPING_THRESHOLD, null)).toBe(0)
    expect(calculateDeliveryFee(FREE_SHIPPING_THRESHOLD + 100, null)).toBe(0)
  })

  it('returns zero when a free shipping coupon is applied', () => {
    expect(
      calculateDeliveryFee(200, { type: 'freeShipping', code: 'FREESHIP' }),
    ).toBe(0)
  })

  it('returns standard delivery fee for orders below threshold without coupon', () => {
    expect(calculateDeliveryFee(200, null)).toBe(DELIVERY_FEE)
    expect(
      calculateDeliveryFee(300, { type: 'percentage', code: 'WELCOME10' }),
    ).toBe(DELIVERY_FEE)
  })
})
