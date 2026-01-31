import React from 'react'
import styles from './PrivacyPolicy.module.css'

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.heading}>Introduction</h2>
            <p className={styles.text}>
              This Privacy Policy describes how we collect, use, and protect your personal information 
              when you use our website and services. We are committed to protecting your privacy and 
              handling your data responsibly.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Information We Collect</h2>
            <p className={styles.text}>
              We may collect the following types of information:
            </p>
            <ul className={styles.list}>
              <li>Personal information you provide when creating an account or placing an order (name, email, address, phone number)</li>
              <li>Payment information necessary to process transactions</li>
              <li>Usage data and browsing behavior on our website</li>
              <li>Communication records when you contact us</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>How We Use Your Information</h2>
            <p className={styles.text}>
              We use the collected information for the following purposes:
            </p>
            <ul className={styles.list}>
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders and inquiries</li>
              <li>To improve our website and services</li>
              <li>To send you marketing communications (with your consent)</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Data Security</h2>
            <p className={styles.text}>
              We implement appropriate security measures to protect your personal information. However, 
              no method of transmission over the internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Data Sharing</h2>
            <p className={styles.text}>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className={styles.list}>
              <li>Service providers who assist in operating our website and processing payments</li>
              <li>Shipping partners to fulfill your orders</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Your Rights</h2>
            <p className={styles.text}>
              You have the right to:
            </p>
            <ul className={styles.list}>
              <li>Access and review your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Cookies</h2>
            <p className={styles.text}>
              Our website uses cookies to enhance your browsing experience. You can control cookie 
              preferences through your browser settings.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Contact Us</h2>
            <p className={styles.text}>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:scrunchcreate@gmail.com" className={styles.link}>
                scrunchcreate@gmail.com
              </a>
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Policy Updates</h2>
            <p className={styles.text}>
              This policy is subject to updates. We will notify you of any significant changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this policy periodically.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
