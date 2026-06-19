/**
 * Why this file exists:
 * Rendered after successful checkout. Displays complete order details,
 * delivery estimation, savings callout, cross-sell recommendations,
 * and a WhatsApp button for custom color/detail discussions.
 *
 * Replaces the old WhatsApp-redirect-only flow with a proper
 * confirmation page, keeping WhatsApp as a secondary option.
 */

import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom';
import { generateWhatsAppLink } from '../../utils/whatsappUtils';
import { getDeliveryDate } from '../../utils/pincodeUtils';
import { getProducts } from '../../services/api';
import { shuffle } from '../../utils/shuffle';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [waLink, setWaLink] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const orderStr = localStorage.getItem('last_order');
    if (orderStr) {
      try {
        const parsedOrder = JSON.parse(orderStr);
        setOrder(parsedOrder);
        setWaLink(generateWhatsAppLink(parsedOrder));
      } catch (err) {
        console.error('Error parsing last order:', err);
      }
    }

    // Load cross-sell recommendations
    getProducts()
      .then((products) => {
        const shuffled = shuffle(products);
        setRecommendations(shuffled.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  /**
   * Calculate order totals from the stored order data
   */
  const orderTotals = useMemo(() => {
    if (!order || !order.items) return null;

    const subtotal = order.items.reduce((sum, item) => {
      const price = item.product?.offerPrice || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    const totalSavings = order.items.reduce((sum, item) => {
      const original = item.product?.originalPrice || item.product?.mrp || item.product?.price || 0;
      const offer = item.product?.offerPrice || item.product?.price || 0;
      return sum + (original - offer) * item.quantity;
    }, 0);

    const deliveryFee = order.deliveryFee ?? (subtotal >= 499 ? 0 : 49);
    const couponDiscount = order.couponDiscount || 0;
    const codFee = order.codFee || 0;
    const total = order.total || (subtotal + deliveryFee - couponDiscount + codFee);

    return { subtotal, totalSavings, deliveryFee, couponDiscount, codFee, total };
  }, [order]);

  const deliveryDate = useMemo(() => {
    // Default 5-7 day estimate
    return getDeliveryDate(5);
  }, []);

  if (!order) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.icon}>
            <svg className={styles.iconSvg} viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className={styles.title}>Order Placed!</h1>
          <p className={styles.subtitle}>
            Thank you for your order. Check your email for details.
          </p>
          <div className={styles.actions}>
            <Link to="/products" className={styles.primaryBtn}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* ─── Hero: Success Animation ─── */}
        <div className={styles.heroSection}>
          <div className={styles.icon}>
            <svg className={styles.iconSvg} viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className={styles.title}>Order Confirmed! 🎉</h1>
          <p className={styles.orderNumber}>
            Order #{order._id?.replace('order_', '') || 'SC' + Date.now().toString().slice(-6)}
          </p>
          <p className={styles.subtitle}>
            Thank you for shopping with Scrunch & Create!
          </p>
        </div>

        {/* ─── Delivery Estimate ─── */}
        <div className={styles.deliveryCard}>
          <div className={styles.deliveryIcon}>📦</div>
          <div>
            <div className={styles.deliveryLabel}>Expected Delivery</div>
            <div className={styles.deliveryDate}>{deliveryDate}</div>
          </div>
        </div>

        {/* ─── Savings Callout ─── */}
        {orderTotals && orderTotals.totalSavings > 0 && (
          <div className={styles.savingsCallout}>
            🎉 You saved <strong>₹{orderTotals.totalSavings.toLocaleString('en-IN')}</strong> on this order!
          </div>
        )}

        {/* ─── Order Details Card ─── */}
        <div className={styles.detailsCard}>
          <h2 className={styles.detailsTitle}>Order Details</h2>

          <ul className={styles.itemsList}>
            {order.items.map((item, idx) => (
              <li key={idx} className={styles.itemRow}>
                {(item.product?.image || (item.product?.images && item.product.images[0])) && (
                  <div
                    className={styles.itemThumb}
                    style={{ backgroundImage: `url(${item.product.image || item.product.images[0]})` }}
                  />
                )}
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.product?.name || 'Product'}</div>
                  {item.product?.color && (
                    <div className={styles.itemMeta}>{item.product.color}</div>
                  )}
                  <div className={styles.itemMeta}>Qty: {item.quantity}</div>
                </div>
                <div className={styles.itemPrice}>
                  ₹{((item.product?.offerPrice || item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                </div>
              </li>
            ))}
          </ul>

          {orderTotals && (
            <div className={styles.priceSummary}>
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>₹{orderTotals.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Delivery</span>
                <span className={orderTotals.deliveryFee === 0 ? styles.freeLabel : ''}>
                  {orderTotals.deliveryFee === 0 ? 'FREE' : `₹${orderTotals.deliveryFee}`}
                </span>
              </div>
              {orderTotals.couponDiscount > 0 && (
                <div className={`${styles.priceRow} ${styles.discountRow}`}>
                  <span>Discount</span>
                  <span>−₹{orderTotals.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {orderTotals.codFee > 0 && (
                <div className={styles.priceRow}>
                  <span>COD handling fee</span>
                  <span>₹{orderTotals.codFee}</span>
                </div>
              )}
              <div className={styles.priceTotalRow}>
                <span>Total Paid</span>
                <span>₹{orderTotals.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Delivery Address & Payment ─── */}
        <div className={styles.infoGrid}>
          {order.shippingAddress && (
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>📍 Delivery Address</h3>
              <p className={styles.infoText}>
                {order.contact?.name && <strong>{order.contact.name}<br /></strong>}
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>💳 Payment</h3>
            <p className={styles.infoText}>
              {order.payment?.method === 'upi' && '📱 UPI'}
              {order.payment?.method === 'card' && '💳 Credit/Debit Card'}
              {order.payment?.method === 'cod' && '💵 Cash on Delivery'}
              {!order.payment?.method && '💳 Online Payment'}
            </p>
            {order.contact?.email && (
              <p className={styles.infoNote}>
                📧 Confirmation sent to {order.contact.email}
              </p>
            )}
          </div>
        </div>

        {/* ─── WhatsApp CTA (secondary) ─── */}
        {waLink && (
          <div className={styles.whatsappCard}>
            <div className={styles.whatsappIcon}>💬</div>
            <div className={styles.whatsappText}>
              <strong>Need to customize colors or sizes?</strong>
              <span>Chat with us on WhatsApp to finalize details</span>
            </div>
            <a href={waLink} className={styles.whatsappBtn} target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          </div>
        )}

        {/* ─── Cross-sell: Complete Your Look ─── */}
        {recommendations.length > 0 && (
          <div className={styles.crossSellSection}>
            <h2 className={styles.crossSellTitle}>You May Also Like</h2>
            <div className={styles.crossSellGrid}>
              {recommendations.map((product) => (
                <Link
                  key={product.id || product._id}
                  to={`/product/${product.slug}`}
                  className={styles.crossSellCard}
                >
                  {(product.image || (product.images && product.images[0])) && (
                    <div
                      className={styles.crossSellThumb}
                      style={{ backgroundImage: `url(${product.image || product.images[0]})` }}
                    />
                  )}
                  <div className={styles.crossSellName}>{product.name}</div>
                  <div className={styles.crossSellPrice}>
                    ₹{(product.offerPrice || product.price || 0).toLocaleString('en-IN')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── Actions ─── */}
        <div className={styles.actions}>
          <Link to="/products" className={styles.primaryBtn}>
            Continue Shopping
          </Link>
          <Link to="/" className={styles.secondaryBtn}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
