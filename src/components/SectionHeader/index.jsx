import React from 'react'
import { Link } from 'react-router-dom'
import styles from './SectionHeader.module.css'

/**
 * Reusable Section Header component with title, subtitle and an optional CTA link.
 * Used across the homepage for consistent branding and layout.
 * 
 * @param {Object} props
 * @param {string} props.title - The main heading title (uses Cormorant Garamond font)
 * @param {string} [props.subtitle] - Optional subtitle displayed below the title
 * @param {string} [props.linkText] - Optional text for the right-side CTA link
 * @param {string} [props.linkHref] - Optional URL for the right-side CTA link
 */
export default function SectionHeader({ title, subtitle, linkText, linkHref }) {
    return (
        <div className={styles.sectionHeader}>
            <div className={styles.left}>
                <h2 className={styles.title}>{title}</h2>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {linkText && linkHref && (
                <Link to={linkHref} className={styles.link}>
                    {linkText} <span className={styles.arrow}>→</span>
                </Link>
            )}
        </div>
    )
}
