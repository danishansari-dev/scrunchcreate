import { describe, expect, it, vi, afterEach } from 'vitest'
import { getProductPrice } from './pricing'

describe('getProductPrice', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns zeros for null or undefined product', () => {
    expect(getProductPrice(null)).toEqual({
      offerPrice: 0,
      originalPrice: 0,
      discountPercent: 0,
    })
    expect(getProductPrice(undefined)).toEqual({
      offerPrice: 0,
      originalPrice: 0,
      discountPercent: 0,
    })
  })

  it('calculates classic scrunchie offer price, MRP, and discount percent', () => {
    const result = getProductPrice({
      id: 'scr-1',
      category: 'scrunchie',
      type: 'classic',
      name: 'Classic Scrunchie',
    })

    expect(result.offerPrice).toBe(40)
    expect(result.originalPrice).toBe(49)
    expect(result.discountPercent).toBe(18)
  })

  it('applies tulip single pricing at ₹69', () => {
    const result = getProductPrice({
      category: 'scrunchie',
      type: 'tulip',
      name: 'Tulip Scrunchie',
    })

    expect(result.offerPrice).toBe(69)
    expect(result.originalPrice).toBe(89)
    expect(result.discountPercent).toBe(22)
  })

  it('applies tulip combo pricing from product name', () => {
    const result = getProductPrice({
      category: 'scrunchie',
      type: 'combo',
      name: 'Tulip combo of 3',
    })

    expect(result.offerPrice).toBe(199)
    expect(result.originalPrice).toBe(249)
    expect(result.discountPercent).toBe(20)
  })

  it('uses printed scrunchie combo price when name includes printed', () => {
    const result = getProductPrice({
      category: 'scrunchie',
      type: 'combo',
      name: 'Combo of 5 printed scrunchies',
    })

    expect(result.offerPrice).toBe(197)
    expect(result.originalPrice).toBe(249)
    expect(result.discountPercent).toBe(21)
  })

  it('prices printed mini hairbow at ₹59', () => {
    const result = getProductPrice({
      category: 'hairbow',
      type: 'printed-mini',
      name: 'Printed Mini Bow',
    })

    expect(result.offerPrice).toBe(59)
    expect(result.originalPrice).toBe(79)
    expect(result.discountPercent).toBe(25)
  })

  it('prices satin hamper gift hamper at ₹699 with 15% markup', () => {
    const result = getProductPrice({
      category: 'gifthamper',
      type: 'satin-hamper',
      name: 'Satin Hamper Gift Hamper',
    })

    expect(result.offerPrice).toBe(699)
    expect(result.originalPrice).toBe(899)
    expect(result.discountPercent).toBe(22)
  })

  it('normalizes spaced category names before lookup', () => {
    const result = getProductPrice({
      category: 'Gift Hamper',
      name: 'Standard Gift Hamper',
    })

    expect(result.offerPrice).toBe(199)
  })

  it('never returns zero offer price for unknown category', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = getProductPrice({
      id: 'unknown',
      category: 'mystery',
      type: 'default',
      name: 'Unknown Product',
    })

    expect(result.offerPrice).toBe(99)
    expect(result.originalPrice).toBeGreaterThan(0)
    expect(warnSpy).toHaveBeenCalled()
  })
})
