/**
 * Why this file exists:
 * One-page checkout combining contact info, delivery address (with pincode
 * auto-fill), payment selection, and order summary. Follows the best patterns
 * identified in the e-commerce checkout analysis research.
 */
import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../features/cart/context/CartContext'
import { useToast } from '../../components/ToastContext'
import { placeOrder } from '../../services/api'
import { useAuth } from '../../features/auth/context/AuthContext'
import CouponField from '../../features/cart/components/CouponField'
import PaymentMethodSelector from '../../features/cart/components/PaymentMethodSelector'
import TrustBadges from '../../components/TrustBadges'
import { lookupPincode, getDeliveryDate } from '../../shared/utils/pincodeUtils'
import styles from './Checkout.module.css'

const initialFormState = {
  email: '',
  phone: '',
  name: '',
  pincode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'India',
}

/**
 * Validates all checkout form fields
 * @param {object} form - Form state object
 * @param {string} paymentMethod - Selected payment method
 * @param {object} paymentDetails - Payment detail fields
 * @returns {object} Error messages keyed by field name
 */
function validateForm(form, paymentMethod, paymentDetails) {
  const errors = {}
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email'
  if (!form.phone.trim()) errors.phone = 'Phone is required'
  else if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = 'Enter a valid 10-digit phone number'
  if (!form.name.trim()) errors.name = 'Full name is required'
  if (!form.pincode.trim()) errors.pincode = 'Pincode is required'
  else if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode'
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address is required'
  if (!form.city.trim()) errors.city = 'City is required'
  if (!form.state.trim()) errors.state = 'State is required'

  // Payment-specific validation
  if (paymentMethod === 'upi' && !paymentDetails.upiId?.trim()) {
    errors.payment = 'Please enter your UPI ID'
  }
  if (paymentMethod === 'card') {
    if (!paymentDetails.cardNumber?.trim()) errors.payment = 'Card number is required'
    else if (!paymentDetails.cardExpiry?.trim()) errors.payment = 'Card expiry is required'
    else if (!paymentDetails.cardCvv?.trim()) errors.payment = 'CVV is required'
  }

  return errors
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart, deliveryFee, grandTotal, couponDiscount, appliedCoupon, totalSavings } = useCart()
  const { show } = useToast()
  const { user } = useAuth()

  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [paymentDetails, setPaymentDetails] = useState({})
  const [deliveryEstimate, setDeliveryEstimate] = useState(null)
  const [showMobileSummary, setShowMobileSummary] = useState(false)

  // Pre-fill user profile name and email if they are authenticated
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // COD handling fee
  const codFee = paymentMethod === 'cod' ? 30 : 0
  const finalTotal = grandTotal + codFee

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * Handles pincode input — triggers auto-fill of city and state
   * when a valid 6-digit code is entered
   */
  const handlePincodeChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setForm((prev) => ({ ...prev, pincode: value }))
    if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: '' }))

    if (value.length === 6) {
      const result = lookupPincode(value)
      if (result.found) {
        setForm((prev) => ({
          ...prev,
          pincode: value,
          city: result.city,
          state: result.state,
        }))
      } else if (result.state) {
        // Partial match: state guessed from prefix
        setForm((prev) => ({
          ...prev,
          pincode: value,
          state: result.state,
        }))
      }
      setDeliveryEstimate({
        days: result.deliveryDays,
        date: getDeliveryDate(result.deliveryDays),
      })
    } else {
      setDeliveryEstimate(null)
    }
  }, [errors.pincode])

  const handlePaymentDetailChange = (field, value) => {
    setPaymentDetails((prev) => ({ ...prev, [field]: value }))
    if (errors.payment) setErrors((prev) => ({ ...prev, payment: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Why this exists: Prevent cross-site scripting (XSS) and invalid characters in order database
    // and downstream systems (like WhatsApp deep linking).
    const sanitizedForm = {
      email: form.email.trim().toLowerCase(),
      phone: form.phone.replace(/\D/g, '').slice(0, 10),
      name: form.name.replace(/[<>]/g, '').trim(),
      pincode: form.pincode.replace(/\D/g, '').slice(0, 6),
      addressLine1: form.addressLine1.replace(/[<>]/g, '').trim(),
      addressLine2: form.addressLine2 ? form.addressLine2.replace(/[<>]/g, '').trim() : '',
      city: form.city.replace(/[<>]/g, '').trim(),
      state: form.state.replace(/[<>]/g, '').trim(),
      country: form.country,
    }

    const sanitizedPaymentDetails = {
      ...paymentDetails,
      upiId: paymentDetails.upiId ? paymentDetails.upiId.replace(/[<>]/g, '').trim() : '',
      cardNumber: paymentDetails.cardNumber ? paymentDetails.cardNumber.replace(/\D/g, '') : '',
      cardExpiry: paymentDetails.cardExpiry ? paymentDetails.cardExpiry.trim() : '',
      cardCvv: paymentDetails.cardCvv ? paymentDetails.cardCvv.replace(/\D/g, '') : '',
    }

    // Update form states so UI displays the cleaned-up/trimmed text
    setForm(sanitizedForm)
    setPaymentDetails(sanitizedPaymentDetails)

    const validationErrors = validateForm(sanitizedForm, paymentMethod, sanitizedPaymentDetails)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]')
      if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.qty
        })),
        shippingAddress: {
          street: sanitizedForm.addressLine1 + (sanitizedForm.addressLine2 ? ', ' + sanitizedForm.addressLine2 : ''),
          city: sanitizedForm.city,
          state: sanitizedForm.state,
          zipCode: sanitizedForm.pincode,
          country: sanitizedForm.country,
        },
        contact: {
          name: sanitizedForm.name,
          email: sanitizedForm.email,
          phone: sanitizedForm.phone,
        },
        payment: {
          method: paymentMethod,
        },
        coupon: appliedCoupon ? appliedCoupon.code : null,
        couponDiscount,
        deliveryFee,
        codFee,
        total: finalTotal,
      }

      await placeOrder(orderData)

      clearCart()
      show('Order placed successfully!', 'success')
      navigate('/order-success')
    } catch (err) {
      console.error('Checkout failed:', err);
      show(err.response?.data?.message || 'Failed to place order. Please try again.', 'error');
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Checkout</h1>
          <div className={styles.empty}>
            Your cart is empty. <Link to="/products" className={styles.emptyLink}>Browse products</Link>.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          <span className={styles.lockIcon}>🔒</span> Secure Checkout
        </h1>

        <form className={styles.content} onSubmit={handleSubmit} noValidate>
          {/* ─── Left Column: Form Sections ─── */}
          <div className={styles.formColumn}>

            {/* Section 1: Contact Information */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>1</span>
                Contact Information
              </h2>
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup} data-error={!!errors.email}>
                  <label className={styles.label} htmlFor="email">Email *</label>
                  <input
                    id="email" name="email" type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>
                <div className={styles.fieldGroup} data-error={!!errors.phone}>
                  <label className={styles.label} htmlFor="phone">Phone *</label>
                  <input
                    id="phone" name="phone" type="tel"
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </div>
              </div>
            </section>

            {/* Section 2: Delivery Address */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>2</span>
                Delivery Address
              </h2>

              <div className={styles.fieldGroup} data-error={!!errors.name}>
                <label className={styles.label} htmlFor="name">Full Name *</label>
                <input
                  id="name" name="name" type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              {/* Pincode first — triggers city/state auto-fill */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup} data-error={!!errors.pincode}>
                  <label className={styles.label} htmlFor="pincode">Pincode *</label>
                  <input
                    id="pincode" name="pincode" type="text"
                    className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`}
                    value={form.pincode}
                    onChange={handlePincodeChange}
                    placeholder="6-digit pincode"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                  />
                  {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="city">City *</label>
                  <input
                    id="city" name="city" type="text"
                    className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    autoComplete="address-level2"
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                </div>
              </div>

              {/* Delivery estimation */}
              {deliveryEstimate && (
                <div className={styles.deliveryEstimate}>
                  📅 Expected delivery: <strong>{deliveryEstimate.date}</strong>
                </div>
              )}

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="addressLine1">Address *</label>
                <input
                  id="addressLine1" name="addressLine1" type="text"
                  className={`${styles.input} ${errors.addressLine1 ? styles.inputError : ''}`}
                  value={form.addressLine1}
                  onChange={handleChange}
                  placeholder="House no., Building, Street"
                  autoComplete="address-line1"
                />
                {errors.addressLine1 && <span className={styles.errorText}>{errors.addressLine1}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="addressLine2">Landmark / Address Line 2 <span className={styles.optional}>(optional)</span></label>
                <input
                  id="addressLine2" name="addressLine2" type="text"
                  className={styles.input}
                  value={form.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, Landmark"
                  autoComplete="address-line2"
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="state">State *</label>
                  <input
                    id="state" name="state" type="text"
                    className={`${styles.input} ${errors.state ? styles.inputError : ''}`}
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    autoComplete="address-level1"
                  />
                  {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="country">Country</label>
                  <input
                    id="country" name="country" type="text"
                    className={styles.input}
                    value={form.country}
                    onChange={handleChange}
                    disabled
                    autoComplete="country-name"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Payment Method */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>3</span>
                Payment Method
              </h2>
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={setPaymentMethod}
                paymentDetails={paymentDetails}
                onDetailChange={handlePaymentDetailChange}
              />
              {errors.payment && <div className={styles.paymentError}>{errors.payment}</div>}
            </section>
          </div>

          {/* ─── Right Column: Order Summary (Sticky) ─── */}
          <aside className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <ul className={styles.summaryList}>
              {items.map((item) => (
                <li key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemThumb}>
                    {(item.image || (item.images && item.images[0])) && (
                      <div
                        className={styles.summaryThumbImg}
                        style={{ backgroundImage: `url(${item.image || item.images[0]})` }}
                      />
                    )}
                    <span className={styles.summaryItemQtyBadge}>{item.qty}</span>
                  </div>
                  <div className={styles.summaryItemInfo}>
                    <span className={styles.summaryItemName}>{item.name}</span>
                    {item.color && <span className={styles.summaryItemMeta}>{item.color}</span>}
                  </div>
                  <span className={styles.summaryItemPrice}>
                    ₹{((item.offerPrice || item.price) * item.qty).toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>

            <div className={styles.summaryDivider} />

            {/* Coupon Field */}
            <CouponField />

            <div className={styles.summaryDivider} />

            {/* Price Breakdown */}
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? styles.freeLabel : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                <span>Discount</span>
                <span>−₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {codFee > 0 && (
              <div className={styles.summaryRow}>
                <span>COD handling fee</span>
                <span>₹{codFee}</span>
              </div>
            )}

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>

            {totalSavings > 0 && (
              <div className={styles.savingsCallout}>
                🎉 You save ₹{totalSavings.toLocaleString('en-IN')} on this order!
              </div>
            )}

            <button
              type="submit"
              className={styles.placeOrderBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : `Place Order — ₹${finalTotal.toLocaleString('en-IN')}`}
            </button>

            <TrustBadges compact />
          </aside>
        </form>

        {/* ─── Mobile Sticky Footer ─── */}
        <div className={styles.mobileSticky}>
          <button
            className={styles.mobileSummaryToggle}
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            type="button"
          >
            <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            <span className={styles.mobileSummaryArrow}>{showMobileSummary ? '▼' : '▲'} View details</span>
          </button>
          <button
            type="submit"
            form="checkout-form"
            className={styles.mobilePlaceOrderBtn}
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </main>
  )
}
