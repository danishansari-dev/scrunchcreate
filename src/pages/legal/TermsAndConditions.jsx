import React from 'react'
import styles from './TermsAndConditions.module.css'

export default function TermsAndConditions() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms & Conditions</h1>
        <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.heading}>Agreement to Terms</h2>
            <p className={styles.text}>
              By accessing and using this website, you agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, please do not use our website.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Use of Website</h2>
            <p className={styles.text}>
              You agree to use this website only for lawful purposes and in a way that does not infringe 
              the rights of others or restrict their use of the website. You must not:
            </p>
            <ul className={styles.list}>
              <li>Use the website in any way that could damage or impair its functionality</li>
              <li>Attempt to gain unauthorized access to any part of the website</li>
              <li>Transmit any malicious code or harmful content</li>
              <li>Use automated systems to access the website without permission</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Product Information</h2>
            <p className={styles.text}>
              We strive to provide accurate product descriptions and images. However, we do not warrant 
              that product descriptions, images, or other content on this website are accurate, complete, 
              or error-free. Product colors may vary due to display settings and photography.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Pricing and Payment</h2>
            <p className={styles.text}>
              All prices are displayed in the currency specified on the website. We reserve the right 
              to change prices at any time without prior notice. Payment must be made in full before 
              order processing. We accept various payment methods as displayed during checkout.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Orders and Acceptance</h2>
            <p className={styles.text}>
              When you place an order, you are making an offer to purchase products. We reserve the right 
              to accept or reject any order at our discretion. Order confirmation does not constitute 
              acceptance of your order. We will notify you if your order is accepted or rejected.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Shipping and Delivery</h2>
            <p className={styles.text}>
              Shipping times and costs are provided during checkout. Delivery times are estimates and 
              not guaranteed. We are not responsible for delays caused by shipping carriers or 
              circumstances beyond our control.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Returns and Refunds</h2>
            <p className={styles.text}>
              Return and refund policies are subject to our current policies at the time of purchase. 
              Please review the specific return policy for your order, which may vary by product or 
              purchase date.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Intellectual Property</h2>
            <p className={styles.text}>
              All content on this website, including text, graphics, logos, images, and software, is 
              the property of the website owner or its content suppliers and is protected by copyright 
              and other intellectual property laws.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Limitation of Liability</h2>
            <p className={styles.text}>
              To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, 
              special, or consequential damages arising from your use of this website or purchase of 
              products, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Indemnification</h2>
            <p className={styles.text}>
              You agree to indemnify and hold us harmless from any claims, damages, or expenses arising 
              from your use of the website, violation of these terms, or infringement of any rights of 
              another party.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Contact Information</h2>
            <p className={styles.text}>
              For questions about these Terms & Conditions, please contact us at{' '}
              <a href="mailto:scrunchcreate@gmail.com" className={styles.link}>
                scrunchcreate@gmail.com
              </a>
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Changes to Terms</h2>
            <p className={styles.text}>
              This policy is subject to updates. We reserve the right to modify these terms at any time. 
              Changes will be effective immediately upon posting on this page. Your continued use of 
              the website after changes are posted constitutes acceptance of the modified terms. We 
              encourage you to review these terms periodically.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
