/**
 * Why this file exists:
 * Premium, user-friendly 404 page that catches broken links or typed URLs.
 * Designed with dynamic CSS animations, rich aesthetics matching the brand, 
 * and clear calls-to-action to keep shoppers engaged.
 */

import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.backgroundGlow} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.decorations} aria-hidden="true">
          <div className={`${styles.bubble} ${styles.bubbleOne}`} />
          <div className={`${styles.bubble} ${styles.bubbleTwo}`} />
          <div className={`${styles.bubble} ${styles.bubbleThree}`} />
        </div>
        
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Lost in the Softness?</h2>
        <p className={styles.description}>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable. Let's get you back to the collection!
        </p>
        
        <div className={styles.actions}>
          <Link to="/" className={styles.primaryBtn}>
            Go Home
          </Link>
          <Link to="/products" className={styles.secondaryBtn}>
            Browse Shop
          </Link>
        </div>
      </div>
    </main>
  )
}
