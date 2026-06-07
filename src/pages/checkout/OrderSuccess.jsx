/**
 * Why this file exists:
 * Rendered when checkout completes. It retrieves the last placed order from 
 * localStorage, builds a WhatsApp deep link, and automatically redirects the user
 * to WhatsApp to finalize custom details and color choices.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { generateWhatsAppLink } from '../../utils/whatsappUtils';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const [waLink, setWaLink] = useState('');

  // Automatically trigger WhatsApp redirect on component load
  useEffect(() => {
    const orderStr = localStorage.getItem('last_order');
    if (orderStr) {
      try {
        const order = JSON.parse(orderStr);
        const link = generateWhatsAppLink(order);
        setWaLink(link);
        
        // Tricky logic: Wait 2 seconds before redirecting, allowing the user 
        // to read the instruction to click "Send" once the WhatsApp app opens.
        const timer = setTimeout(() => {
          window.location.href = link;
        }, 2000);
        
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Error parsing last order for WhatsApp redirection', err);
      }
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.icon}>
          <svg className={styles.iconSvg} viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className={styles.title}>Redirecting to WhatsApp...</h1>
        <p className={styles.subtitle}>
          If WhatsApp didn't open automatically, please click the button below to message the boutique owner and complete your order.
        </p>
        <div className={styles.warning}>
          Please hit <strong>Send</strong> in WhatsApp to submit your order details!
        </div>
        <div className={styles.actions}>
          {waLink && (
            <a href={waLink} className={styles.primaryBtn}>
              Open WhatsApp Manually
            </a>
          )}
          <Link to="/products" className={styles.secondaryBtn}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
