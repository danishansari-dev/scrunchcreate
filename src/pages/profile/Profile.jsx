import React from 'react'
import styles from './Profile.module.css'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { currentUser, logout } = useAuth()

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
