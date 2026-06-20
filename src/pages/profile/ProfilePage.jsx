import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { getMyOrders } from '../../services/api';
import { generateWhatsAppLink } from '../../shared/utils/whatsappUtils';
import styles from './ProfilePage.module.css';

/**
 * Why this file exists:
 * Serves as the user's dashboard after logging in.
 * Displays details about their account profile and provides a fully interactive,
 * high-fidelity dashboard to track order histories, expand order details,
 * re-trigger WhatsApp checkout deep links, and contact support.
 */
export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  // Track which order card is currently expanded in the accordion
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    // If auth finishes loading and there is no user, redirect to login
    if (!authLoading && !user) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
      return;
    }

    if (user) {
      setOrdersLoading(true);
      getMyOrders()
        .then((data) => {
          setOrders(data);
        })
        .catch((err) => {
          console.error('[ProfilePage] Failed to fetch user orders:', err);
        })
        .finally(() => {
          setOrdersLoading(false);
        });
    }
  }, [user, authLoading, navigate]);

  /**
   * Toggles the accordion expansion for a specific order card
   * @danishansari-dev orderId - Unique order ID string
   */
  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  /**
   * Triggers logout action and redirects to home page
   */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /**
   * Formats ISO date string to readable Indian date format
   * @danishansari-dev dateString - ISO Date string
   * @returns {string} Formatted date string (e.g. "Jun 20, 2026")
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Generates a direct WhatsApp link to ask support about a specific order
   * @danishansari-dev orderId - Unique order ID string
   * @returns {string} WhatsApp support link
   */
  const getSupportLink = (orderId) => {
    const phone = '917300969491';
    const message = `Hi Scrunch & Create, I have a question regarding my order #${orderId}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (authLoading || (user && ordersLoading)) {
    return (
      <main className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading your dashboard...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        
        {/* Left Column: Account Summary Sidebar */}
        <section className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
            <h2 className={styles.userName}>{user.name}</h2>
            <p className={styles.userEmail}>{user.email}</p>
            <div className={styles.metaRow}>
              <span>Member Since:</span>
              <strong>{formatDate(user.createdAt)}</strong>
            </div>
            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
              type="button"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* Right Column: Order History Dashboard */}
        <section className={styles.content}>
          <h1 className={styles.dashboardTitle}>Order History</h1>
          <p className={styles.dashboardSub}>
            Track statuses and review invoices of your recent orders.
          </p>

          {orders.length === 0 ? (
            <div className={styles.emptyOrders}>
              <div className={styles.emptyIcon}>🛍️</div>
              <h3>No Orders Placed Yet</h3>
              <p>You haven't ordered any premium hair accessories yet. Let's find something beautiful for you!</p>
              <Link to="/products" className={styles.shopBtn}>
                Browse Products
              </Link>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id || expandedOrderId === order._id;
                const oId = order.id || order._id;
                
                // Determine order status pill class
                let statusClass = styles.statusPending;
                const status = order.status ? order.status.toLowerCase() : 'pending';
                if (status === 'delivered') statusClass = styles.statusDelivered;
                else if (status === 'shipped') statusClass = styles.statusShipped;
                else if (status === 'processing') statusClass = styles.statusProcessing;
                else if (status === 'cancelled') statusClass = styles.statusCancelled;

                return (
                  <div 
                    key={oId} 
                    className={`${styles.orderCard} ${isExpanded ? styles.orderCardExpanded : ''}`}
                  >
                    {/* Header: Clickable to expand */}
                    <div 
                      className={styles.orderHeader} 
                      onClick={() => toggleExpand(oId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(oId); }}
                    >
                      <div className={styles.headerMeta}>
                        <span className={styles.orderIdLabel}>Order #{oId}</span>
                        <span className={styles.orderDate}>{formatDate(order.created_at || order.createdAt)}</span>
                      </div>
                      
                      <div className={styles.headerRight}>
                        <span className={`${styles.statusBadge} ${statusClass}`}>
                          {order.status || 'Pending'}
                        </span>
                        <span className={styles.orderTotalHeader}>
                          ₹{(order.total || 0).toLocaleString('en-IN')}
                        </span>
                        <svg 
                          className={`${styles.arrowIcon} ${isExpanded ? styles.arrowIconRotated : ''}`} 
                          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {/* Expandable Order Details Panel */}
                    {isExpanded && (
                      <div className={styles.orderDetails}>
                        <div className={styles.detailsGrid}>
                          
                          {/* Details Column 1: Items List */}
                          <div className={styles.detailsItems}>
                            <h4>Ordered Items</h4>
                            <ul className={styles.itemsList}>
                              {order.items?.map((item, idx) => {
                                const prod = item.product || {};
                                const imgUrl = prod.image || (prod.images && prod.images[0]) || prod.primaryImage;
                                
                                return (
                                  <li key={idx} className={styles.itemRow}>
                                    {imgUrl ? (
                                      <div 
                                        className={styles.itemThumb} 
                                        style={{ backgroundImage: `url(${imgUrl})` }}
                                      />
                                    ) : (
                                      <div className={styles.itemThumbPlaceholder}>🎀</div>
                                    )}
                                    <div className={styles.itemInfo}>
                                      <span className={styles.itemName}>{prod.name || 'Premium Accessory'}</span>
                                      <div className={styles.itemMeta}>
                                        {prod.color && <span>Color: {prod.color}</span>}
                                        <span>Qty: {item.quantity}</span>
                                      </div>
                                    </div>
                                    <span className={styles.itemPrice}>
                                      ₹{((prod.offerPrice || prod.price || 0) * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Details Column 2: Invoice Summary & Shipping */}
                          <div className={styles.detailsSummary}>
                            <h4>Summary & Address</h4>
                            
                            {/* Invoice Breakdown */}
                            <div className={styles.invoiceTable}>
                              <div className={styles.invoiceRow}>
                                <span>Subtotal</span>
                                <span>₹{((order.total || 0) - (order.deliveryFee || order.delivery_fee || 0) - (order.codFee || order.cod_fee || 0) + (order.couponDiscount || order.coupon_discount || 0)).toLocaleString('en-IN')}</span>
                              </div>
                              
                              {(order.deliveryFee > 0 || order.delivery_fee > 0) && (
                                <div className={styles.invoiceRow}>
                                  <span>Delivery</span>
                                  <span>₹{order.deliveryFee || order.delivery_fee}</span>
                                </div>
                              )}
                              
                              {(order.codFee > 0 || order.cod_fee > 0) && (
                                <div className={styles.invoiceRow}>
                                  <span>COD Fee</span>
                                  <span>₹{order.codFee || order.cod_fee}</span>
                                </div>
                              )}

                              {(order.couponDiscount > 0 || order.coupon_discount > 0) && (
                                <div className={`${styles.invoiceRow} ${styles.invoiceDiscount}`}>
                                  <span>Coupon Discount ({order.coupon})</span>
                                  <span>−₹{order.couponDiscount || order.coupon_discount}</span>
                                </div>
                              )}

                              <div className={styles.invoiceDivider} />
                              <div className={`${styles.invoiceRow} ${styles.invoiceTotal}`}>
                                <span>Total Paid</span>
                                <span>₹{(order.total || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            {/* Shipping Information */}
                            {order.shippingAddress && (
                              <div className={styles.shippingInfo}>
                                <h5>Shipping Details</h5>
                                <p>{order.contact?.name || user.name}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                                <p>Phone: {order.contact?.phone || 'N/A'}</p>
                              </div>
                            )}

                            {/* Action Deep Links */}
                            <div className={styles.actionsGroup}>
                              
                              {/* If status is pending, allow complete checkout on WhatsApp */}
                              {status === 'pending' && (
                                <a 
                                  href={generateWhatsAppLink(order)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={styles.btnCompleteCheckout}
                                >
                                  💬 Complete Order on WhatsApp
                                </a>
                              )}
                              
                              <a 
                                href={getSupportLink(oId)} 
                                target="_blank" 
                                  rel="noopener noreferrer"
                                className={styles.btnSupport}
                              >
                                🙋 Need Help? Contact Support
                              </a>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
