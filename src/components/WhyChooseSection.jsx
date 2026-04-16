import React from 'react'
import styles from './WhyChooseSection.module.css'

// Sparkle/Star Icon for Handmade
const HandmadeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
    </svg>
)

// Ribbon/Award Icon for Premium
const PremiumIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
)

// Leaf Icon for Eco-friendly
const EcoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
)

// Heart Icon for Hair-Safe
const HairSafeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
)

const features = [
    {
        icon: HandmadeIcon,
        title: 'Handmade in India',
        description: 'Each piece is crafted with love and attention to detail',
    },
    {
        icon: PremiumIcon,
        title: 'Premium Fabric',
        description: 'Only the finest materials for gentle, long-lasting wear',
    },
    {
        icon: EcoIcon,
        title: 'Eco-friendly Packaging',
        description: "Sustainable packaging that's kind to our planet",
    },
    {
        icon: HairSafeIcon,
        title: 'Hair-Safe Design',
        description: 'No snags, no damage - just beautiful, healthy hair',
    },
]

export default function WhyChooseSection() {
    return (
        <section className={styles.whyChooseSection}>
            <h2 className={styles.sectionTitle}>Why Choose Scrunch & Create</h2>
            <div className={styles.featuresGrid}>
                {features.map((feature, index) => (
                    <div key={index} className={styles.featureCard}>
                        <div className={styles.iconWrapper}>
                            <feature.icon />
                        </div>
                        <h3 className={styles.featureTitle}>{feature.title}</h3>
                        <p className={styles.featureDescription}>{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
