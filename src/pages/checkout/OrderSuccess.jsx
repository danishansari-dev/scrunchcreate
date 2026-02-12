export default function OrderSuccess() {
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
                    If WhatsApp didn't open automatically, please check your pop-up blocker or click the link below if generated.
                </p>
                <div className={styles.warning}>
                    Please hit <strong>Send</strong> in WhatsApp to complete your order!
                </div>
                <div className={styles.actions}>
                    <Link to="/products" className={styles.primaryBtn}>
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </main>
    )
}
