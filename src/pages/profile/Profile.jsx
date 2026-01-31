import React, { useState, useEffect } from 'react'
import styles from './Profile.module.css'
import { useAuth } from '../../context/AuthContext'

function getOrders() {
  try {
    const raw = localStorage.getItem('orders')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Profile() {
  const { currentUser, logout } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    setOrders(getOrders())
  }, [])

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <h1 className={styles.title}>Welcome back, {currentUser?.name || 'Guest'}.</h1>
            <p className={styles.subtitle}>Manage your details, addresses and preferences.</p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Account details</h2>
            <p className={styles.sectionText}>Email: {currentUser?.email}</p>
          </div>

          {/* Order History */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Order History</h2>
            {sortedOrders.length === 0 ? (
              <p className={styles.emptyOrders}>No orders yet. Start shopping!</p>
            ) : (
              <ul className={styles.orderList}>
                {sortedOrders.map((order) => {
                  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)
                  const productNames = order.items.slice(0, 2).map((item) => item.name).join(', ')
                  const moreItems = order.items.length > 2 ? ` +${order.items.length - 2} more` : ''
                  return (
                    <li key={order.id} className={styles.orderItem}>
                      <div className={styles.orderHeader}>
                        <span className={styles.orderId}>{order.id}</span>
                        <span className={styles.orderDate}>{formatDate(order.date)}</span>
                      </div>
                      <div className={styles.orderDetails}>
                        <span className={styles.orderItems}>
                          {itemCount} item{itemCount !== 1 ? 's' : ''} — {productNames}{moreItems}
                        </span>
                        <span className={styles.orderTotal}>₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Quick actions</h2>
            <p className={styles.sectionText}>Update your information or sign out of your account.</p>
            <div className={styles.actions}>
              <button className={styles.primary}>Edit details</button>
              <button className={styles.ghost} onClick={logout}>Sign out</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

