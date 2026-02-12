import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../components/CartContext'
import { useToast } from '../../components/ToastContext'
import { generateWhatsAppMessage } from '../../utils/whatsappUtils'
import styles from './Checkout.module.css'

const initialFormState = {
  name: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
}

function validateForm(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.phone.trim()) errors.phone = 'Phone is required'
  else if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = 'Enter a valid 10-digit phone number'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email'
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address is required'
  if (!form.city.trim()) errors.city = 'City is required'
  if (!form.state.trim()) errors.state = 'State is required'
  if (!form.pincode.trim()) errors.pincode = 'Pincode is required'
  else if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode'
  if (!form.country.trim()) errors.country = 'Country is required'
  return errors
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { show } = useToast()

  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const delivery = subtotal >= 499 ? 0 : 49
  const total = subtotal + delivery

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    // Generate WhatsApp URL with full details
    const whatsappUrl = generateWhatsAppMessage(items, subtotal, form)

    // Open WhatsApp
    window.open(whatsappUrl, '_blank')

    // Clear cart and redirect
    clearCart()
    show('Redirecting to WhatsApp...', 'success')
    navigate('/order-success')
  }

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Checkout</h1>
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
        <h1 className={styles.title}>Checkout</h1>

        <form className={styles.content} onSubmit={handleSubmit}>
          {/* Shipping Form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Shipping Address</h2>
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label} htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label} htmlFor="addressLine1">Address Line 1 *</label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  className={`${styles.input} ${errors.addressLine1 ? styles.inputError : ''}`}
                  value={form.addressLine1}
                  onChange={handleChange}
                  placeholder="House no., Building, Street"
                />
                {errors.addressLine1 && <span className={styles.errorText}>{errors.addressLine1}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.label} htmlFor="addressLine2">Address Line 2</label>
                <input
                  id="addressLine2"
                  name="addressLine2"
                  type="text"
                  className={styles.input}
                  value={form.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, Landmark (optional)"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="city">City *</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="state">State *</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    className={`${styles.input} ${errors.state ? styles.inputError : ''}`}
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                  {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="pincode">Pincode *</label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`}
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                  />
                  {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="country">Country *</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    className={`${styles.input} ${errors.country ? styles.inputError : ''}`}
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                  {errors.country && <span className={styles.errorText}>{errors.country}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <aside className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <ul className={styles.summaryList}>
              {items.map((item) => (
                <li key={item.id} className={styles.summaryItem}>
                  <span className={styles.summaryItemName}>{item.name}</span>
                  <span className={styles.summaryItemQty}>× {item.qty}</span>
                </li>
              ))}
            </ul>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery</span>
              <span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button
              type="submit"
              className={styles.placeOrderBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Opening WhatsApp...' : 'Place Order on WhatsApp'}
            </button>
          </aside>
        </form>
      </div>
    </main>
  )
}
