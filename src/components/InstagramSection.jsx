import React from 'react';
import styles from './InstagramSection.module.css';

// Sample curated list of Instagram reels with thumbnail images
// Using Instagram CDN URLs for thumbnails
const instagramPosts = [
    {
        id: 'DJEMrDroUga',
        type: 'reel',
        // Thumbnail will be loaded via Instagram's oEmbed or we use a placeholder
    },
    {
        id: 'DUDhH9sgcmV',
        type: 'reel',
    },
    {
        id: 'DLXe9bRhcY-',
        type: 'reel',
    },
    {
        id: 'DSXUi_8gXcS',
        type: 'reel',
    },
];

function InstagramCard({ post }) {
    const postUrl = `https://www.instagram.com/${post.type === 'reel' ? 'reel' : 'p'}/${post.id}/`;

    return (
        <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
            aria-label="View on Instagram"
        >
            {/* Video container using iframe without Instagram UI */}
            <div className={styles.mediaContainer}>
                <iframe
                    src={`https://www.instagram.com/${post.type === 'reel' ? 'reel' : 'p'}/${post.id}/embed/?hidecaption=true`}
                    className={styles.embedFrame}
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency="true"
                    allowFullScreen
                    title={`Instagram ${post.type}`}
                />
                {/* Overlay to crop out Instagram UI elements */}
                <div className={styles.cropOverlay} />
            </div>

            {/* Play button overlay for reels */}
            {post.type === 'reel' && (
                <div className={styles.playOverlay}>
                    <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            )}

            {/* Instagram branding on hover */}
            <div className={styles.hoverOverlay}>
                <svg className={styles.instagramIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>View on Instagram</span>
            </div>
        </a>
    );
}

export default function InstagramSection() {
    return (
        <section className={styles.instagramSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </div>
                    <h2 className={styles.title}>Follow Us on Instagram</h2>
                    <a
                        href="https://www.instagram.com/scrunch_and_create"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.handle}
                    >
                        @scrunch_and_create
                    </a>
                </div>

                <div className={styles.grid}>
                    {instagramPosts.map((post) => (
                        <InstagramCard key={post.id} post={post} />
                    ))}
                </div>

                <div className={styles.footer}>
                    <a
                        href="https://www.instagram.com/scrunch_and_create"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.followButton}
                    >
                        View More on Instagram
                    </a>
                </div>
            </div>
        </section>
    );
}
