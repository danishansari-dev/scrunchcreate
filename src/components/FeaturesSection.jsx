import React from 'react'
import styles from './FeaturesSection.module.css'

const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.684-.949V8a1 1 0 0 1 1-1h4.28a1 1 0 0 1 .97.757l1.143 4.572A1.5 1.5 0 0 1 21.5 14v3a1 1 0 0 1-1 1h-1" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
    </svg>
)

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
)

const BoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
)

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
)

const featuresData = [
    {
        icon: TruckIcon,
        title: 'Free Shipping',
        subtitle: 'On orders above ₹999',
    },
    {
        icon: ShieldIcon,
        title: 'Quality Assured',
        subtitle: 'Premium handmade products',
    },
    {
        icon: BoxIcon,
        title: 'Eco Packaging',
        subtitle: 'Sustainable & beautiful',
    },
    {
        icon: HeartIcon,
        title: 'Made with Love',
        subtitle: 'Handcrafted in India',
    },
]

export default function FeaturesSection() {
    return (
        <section className={styles.featuresSection}>
            {featuresData.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                    <div className={styles.iconWrapper}>
                        <feature.icon />
                    </div>
                    <div className={styles.textWrapper}>
                        <span className={styles.title}>{feature.title}</span>
                        <span className={styles.subtitle}>{feature.subtitle}</span>
                    </div>
                </div>
            ))}
        </section>
    )
}
