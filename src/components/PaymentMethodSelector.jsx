/**
 * Why this file exists:
 * Payment method selection with radio cards for UPI, Card, and COD.
 * Optimized for Indian market: UPI is default since it accounts for
 * ~85% of digital payments in India.
 */
import styles from './PaymentMethodSelector.module.css'

const PAYMENT_METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    description: 'Google Pay, PhonePe, Paytm & more',
    icon: '📱',
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: '💳',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: '💵',
    extraFee: 30,
  },
]

/**
 * Payment method selector component
 * @param {object} props
 * @param {string} props.selected - Currently selected payment method ID
 * @param {function} props.onSelect - Callback when payment method is changed
 * @param {object} props.paymentDetails - Payment details (upiId, cardNumber etc.)
 * @param {function} props.onDetailChange - Callback when payment detail fields change
 */
export default function PaymentMethodSelector({ selected, onSelect, paymentDetails, onDetailChange }) {
  return (
    <div className={styles.container}>
      {PAYMENT_METHODS.map((method) => (
        <div key={method.id} className={styles.methodWrapper}>
          <label
            className={`${styles.method} ${selected === method.id ? styles.methodActive : ''}`}
            htmlFor={`payment-${method.id}`}
          >
            <input
              type="radio"
              id={`payment-${method.id}`}
              name="paymentMethod"
              value={method.id}
              checked={selected === method.id}
              onChange={() => onSelect(method.id)}
              className={styles.radio}
            />
            <span className={styles.methodIcon}>{method.icon}</span>
            <div className={styles.methodInfo}>
              <div className={styles.methodLabel}>{method.label}</div>
              <div className={styles.methodDesc}>{method.description}</div>
            </div>
            {method.extraFee && (
              <span className={styles.extraFee}>+₹{method.extraFee}</span>
            )}
            <span className={styles.radioIndicator} />
          </label>

          {/* Expanded content for selected method */}
          {selected === method.id && (
            <div className={styles.methodBody}>
              {method.id === 'upi' && (
                <div className={styles.fieldGroup}>
                  <input
                    type="text"
                    className={styles.methodInput}
                    placeholder="Enter UPI ID (e.g., name@upi)"
                    value={paymentDetails.upiId || ''}
                    onChange={(e) => onDetailChange('upiId', e.target.value)}
                    aria-label="UPI ID"
                  />
                  <div className={styles.methodHint}>
                    You'll be redirected to your UPI app to complete payment
                  </div>
                </div>
              )}

              {method.id === 'card' && (
                <div className={styles.cardFields}>
                  <input
                    type="text"
                    className={styles.methodInput}
                    placeholder="Card number"
                    value={paymentDetails.cardNumber || ''}
                    onChange={(e) => onDetailChange('cardNumber', e.target.value)}
                    maxLength={19}
                    aria-label="Card number"
                  />
                  <div className={styles.cardRow}>
                    <input
                      type="text"
                      className={styles.methodInput}
                      placeholder="MM/YY"
                      value={paymentDetails.cardExpiry || ''}
                      onChange={(e) => onDetailChange('cardExpiry', e.target.value)}
                      maxLength={5}
                      aria-label="Card expiry"
                    />
                    <input
                      type="text"
                      className={styles.methodInput}
                      placeholder="CVV"
                      value={paymentDetails.cardCvv || ''}
                      onChange={(e) => onDetailChange('cardCvv', e.target.value)}
                      maxLength={4}
                      aria-label="CVV"
                    />
                  </div>
                  <input
                    type="text"
                    className={styles.methodInput}
                    placeholder="Name on card"
                    value={paymentDetails.cardName || ''}
                    onChange={(e) => onDetailChange('cardName', e.target.value)}
                    aria-label="Name on card"
                  />
                </div>
              )}

              {method.id === 'cod' && (
                <div className={styles.codInfo}>
                  <div className={styles.codNote}>
                    💡 A ₹30 handling fee applies for Cash on Delivery orders.
                    Please keep exact change ready for the delivery partner.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
