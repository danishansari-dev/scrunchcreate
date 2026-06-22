/**
 * Why this file exists:
 * The AdminDashboard is the central hub for storefront administrators.
 * It provides overview analytics, catalog management (add/edit/delete products),
 * and order fulfillment controls (updating order status).
 */
import { useState, useEffect, useMemo } from 'react';
import styles from './AdminDashboard.module.css';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useToast } from '../../components/ToastContext';
import {
  adminGetAllOrders,
  adminUpdateOrderStatus,
  getProducts,
  adminDeleteProduct,
  adminSaveProduct
} from '../../services/api';
import ProductForm from './ProductForm';

/**
 * AdminDashboard renders administration panels and stats.
 * Why: Entry point for store managers to configure items and review sales.
 * Tricky logic: Summarizes stats on the fly from fetched data and uses optimistic
 * state updates for order status and stock toggles to make the UI feel fast.
 * @returns Renders the Admin Dashboard UI
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const { show } = useToast();

  // Active view tab: 'overview', 'orders', or 'products'
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal / Form state for Add/Edit product
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Expandable row state in the orders list
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Load all dashboard records on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersList, productsList] = await Promise.all([
          adminGetAllOrders(),
          getProducts()
        ]);
        setOrders(ordersList);
        setProducts(productsList);
      } catch (err) {
        console.error('[AdminDashboard] Fetch error:', err.message);
        show('Failed to load dashboard data. Check database permissions.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [show]);

  // Compute analytics summaries
  const stats = useMemo(() => {
    const grossSales = orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    
    const outOfStockProducts = products.filter(p => !p.inStock && !p.in_stock).length;

    // Why: Count products that have low stock level (between 1 and 5 units) or have variants with low stock
    const lowStockProducts = products.filter(p => {
      const parentLow = p.stock !== undefined && p.stock <= 5 && p.stock > 0;
      const variantsLow = p.variants && p.variants.some(v => v.stock !== undefined && v.stock <= 5 && v.stock > 0);
      return parentLow || variantsLow;
    }).length;

    return {
      grossSales,
      totalOrders: orders.length,
      pendingOrders,
      outOfStockProducts,
      lowStockProducts
    };
  }, [orders, products]);

  /**
   * Toggles the accordion expansion for a specific order row.
   * @danishansari-dev orderId - Unique order identifier string
   */
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  /**
   * Updates an order status in database and local state.
   * @danishansari-dev orderId - Unique order ID string
   * @danishansari-dev newStatus - Target status string ('Pending', 'Dispatched', 'Delivered', 'Cancelled')
   */
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      await adminUpdateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      show(`Order status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.error(err);
      show('Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Toggles a product's inStock status.
   * @danishansari-dev product - Product data object
   */
  const handleToggleStock = async (product) => {
    const isNowInStock = !product.inStock;
    // Why: Toggling stock should sync the numerical quantity (e.g. set to 20 if marking in-stock, 0 if marking out-of-stock)
    const nextStockQty = isNowInStock ? (product.stock > 0 ? product.stock : 20) : 0;
    try {
      // Create clone with toggled state
      const updatedProduct = {
        ...product,
        inStock: isNowInStock,
        in_stock: isNowInStock,
        stock: nextStockQty
      };

      // Optimistic local state update
      setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));

      await adminSaveProduct(updatedProduct);
      show(`Stock status updated for ${product.name}`, 'success');
    } catch (err) {
      console.error(err);
      show('Failed to update stock status', 'error');
      // Revert local state on failure
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    }
  };

  /**
   * Triggers deletion of a product.
   * @danishansari-dev productId - Unique product ID string
   */
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await adminDeleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      show('Product successfully deleted', 'success');
    } catch (err) {
      console.error(err);
      show('Failed to delete product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Launches the editor modal for a product.
   * @danishansari-dev product - Product data object, or null for creating a new product
   */
  const openEditorForm = (product = null) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  /**
   * Handles saved product details returning from ProductForm.
   * @danishansari-dev savedRow - Enriched product row returned by API
   */
  const handleProductSaved = (savedRow) => {
    const formattedProduct = {
      ...savedRow,
      inStock: savedRow.in_stock,
      offerPrice: savedRow.offer_price,
      originalPrice: savedRow.original_price,
      discountPercent: savedRow.discount_percent,
      primaryImage: savedRow.primary_image,
      colorHex: savedRow.color_hex,
      normalizedColor: savedRow.normalized_color
    };

    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === savedRow.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = formattedProduct;
        return next;
      }
      return [formattedProduct, ...prev];
    });

    setIsFormOpen(false);
    show('Product saved successfully', 'success');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading administration console...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.adminTitle}>Admin Panel</div>
        <div className={styles.adminUser}>
          <span className={styles.userIcon}>⚙️</span>
          <div>
            <div className={styles.adminName}>{user?.name}</div>
            <div className={styles.adminRole}>Store Administrator</div>
          </div>
        </div>
        
        <nav className={styles.sideNav}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          >
            📊 Store Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
          >
            📦 Order Fulfilment ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`${styles.tabBtn} ${activeTab === 'products' ? styles.tabBtnActive : ''}`}
          >
            🛍️ Catalog Manager ({products.length})
          </button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <section className={styles.overviewSection}>
            <h2 className={styles.sectionHeader}>Overview Analytics</h2>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Delivered Revenue</div>
                <div className={styles.statValue}>₹{(stats.grossSales).toLocaleString('en-IN')}</div>
                <div className={styles.statSubtitle}>Completed sales total</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Orders</div>
                <div className={styles.statValue}>{stats.totalOrders}</div>
                <div className={styles.statSubtitle}>All transactions placed</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Pending Shipments</div>
                <div className={styles.statValue}>{stats.pendingOrders}</div>
                <div className={styles.statSubtitle}>Need dispatch/delivery</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Inventory Alerts</div>
                <div className={styles.statValue}>
                  {stats.outOfStockProducts} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>out</span>
                  {' / '}
                  {stats.lowStockProducts} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>low</span>
                </div>
                <div className={styles.statSubtitle}>Out of stock / Low stock (&lt;5)</div>
              </div>
            </div>

            <div className={styles.recentPanel}>
              <h3 className={styles.panelTitle}>Recent Orders</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td className={styles.fontMono}>{o.id.substring(6, 14)}...</td>
                        <td>{o.contact?.name || 'Guest User'}</td>
                        <td>{new Date(o.created_at).toLocaleDateString('en-IN', { dateStyle: 'short' })}</td>
                        <td>₹{o.total}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles['status_' + (o.status || 'Pending').toLowerCase()]}`}>
                            {o.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="5" className={styles.emptyCell}>No orders placed yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: ORDER MANAGER */}
        {activeTab === 'orders' && (
          <section className={styles.ordersSection}>
            <h2 className={styles.sectionHeader}>Order Fulfillment Manager</h2>

            <div className={styles.tableWrapper}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Order Total</th>
                    <th>Fulfillment Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const isExpanded = expandedOrders.has(o.id);
                    return (
                      <>
                        <tr key={o.id} className={isExpanded ? styles.expandedRow : ''}>
                          <td>
                            <button
                              onClick={() => toggleOrderExpansion(o.id)}
                              className={styles.expandBtn}
                            >
                              {isExpanded ? '▼' : '▶'}
                            </button>
                          </td>
                          <td className={styles.fontMono}>{o.id.substring(6)}</td>
                          <td>
                            <div className={styles.bold}>{o.contact?.name || 'Guest User'}</div>
                            <div className={styles.subtext}>{o.contact?.email}</div>
                          </td>
                          <td>{new Date(o.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                          <td className={styles.bold}>₹{o.total}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles['status_' + (o.status || 'Pending').toLowerCase()]}`}>
                              {o.status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <select
                              value={o.status || 'Pending'}
                              disabled={actionLoading}
                              onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                              className={styles.statusSelect}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={o.id + '_details'} className={styles.detailsRow}>
                            <td colSpan="7">
                              <div className={styles.detailsContainer}>
                                <div className={styles.detailsGrid}>
                                  <div>
                                    <h4 className={styles.detailsSubheading}>Shipping Address</h4>
                                    <p className={styles.addressText}>{o.shippingAddress?.addressLine}</p>
                                    <p className={styles.addressText}>
                                      {o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}
                                    </p>
                                    <p className={styles.addressText}>📞 {o.contact?.phone}</p>
                                  </div>
                                  <div>
                                    <h4 className={styles.detailsSubheading}>Payment Summary</h4>
                                    <p className={styles.detailsText}>Method: {o.payment?.method === 'cod' ? 'Cash on Delivery (COD)' : o.payment?.method}</p>
                                    <p className={styles.detailsText}>Delivery Fee: ₹{o.deliveryFee}</p>
                                    {o.codFee > 0 && <p className={styles.detailsText}>COD Service Fee: ₹{o.codFee}</p>}
                                    {o.couponDiscount > 0 && <p className={styles.detailsText}>Coupon Savings: -₹{o.couponDiscount} ({o.coupon})</p>}
                                  </div>
                                </div>

                                <div className={styles.itemsPanel}>
                                  <h4 className={styles.detailsSubheading}>Ordered Items</h4>
                                  <ul className={styles.orderItemsList}>
                                    {(o.items || []).map((item, idx) => (
                                      <li key={idx} className={styles.orderItemRow}>
                                        <div className={styles.itemThumbWrapper}>
                                          <img
                                            src={item.product?.image || item.product?.primaryImage}
                                            alt={item.product?.name}
                                            className={styles.itemThumb}
                                          />
                                        </div>
                                        <div className={styles.itemMeta}>
                                          <div className={styles.itemName}>{item.product?.name}</div>
                                          <div className={styles.itemColor}>Variant: {item.product?.color || 'Standard'}</div>
                                        </div>
                                        <div className={styles.itemQtyPrice}>
                                          {item.quantity} x ₹{item.product?.offerPrice || item.product?.price} = ₹{item.quantity * (item.product?.offerPrice || item.product?.price)}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="7" className={styles.emptyCell}>No customer orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: PRODUCT MANAGER */}
        {activeTab === 'products' && (
          <section className={styles.productsSection}>
            <div className={styles.productsHeader}>
              <h2 className={styles.sectionHeader}>Catalog &amp; Inventory</h2>
              <button
                onClick={() => openEditorForm(null)}
                className={styles.addProductBtn}
              >
                ➕ Add New Product
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Pricing</th>
                    <th>Inventory Status</th>
                    <th>Manage Options</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.primaryImage || p.image}
                          alt={p.name}
                          className={styles.productThumb}
                        />
                      </td>
                      <td>
                        <div className={styles.bold}>{p.name}</div>
                        <div className={styles.subtext}>Slug: {p.slug}</div>
                        {p.variants && p.variants.length > 0 && (
                          <div className={styles.variantsCountBadge}>
                            {p.variants.length} color variant(s)
                          </div>
                        )}
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <div className={styles.bold}>₹{p.offerPrice}</div>
                        {p.originalPrice > p.offerPrice && (
                          <div className={styles.strikeText}>₹{p.originalPrice}</div>
                        )}
                      </td>
                      <td>
                        <div className={styles.stockToggleContainer}>
                          <span className={p.stock <= 0 ? styles.textDanger : p.stock <= 5 ? styles.textWarning : styles.textSuccess}>
                            {p.stock <= 0 ? 'Out of Stock' : p.stock <= 5 ? `Low Stock (${p.stock})` : `In Stock (${p.stock})`}
                          </span>
                          <button
                            onClick={() => handleToggleStock(p)}
                            className={`${styles.toggleSwitch} ${p.inStock && p.stock > 0 ? styles.toggleSwitchOn : ''}`}
                            aria-label={`Toggle stock status for ${p.name}`}
                          >
                            <span className={styles.toggleKnob} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            onClick={() => openEditorForm(p)}
                            className={styles.editBtn}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            disabled={actionLoading}
                            className={styles.deleteBtn}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="6" className={styles.emptyCell}>No products loaded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Slide-over product form */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSave={handleProductSaved}
        />
      )}
    </div>
  );
}
