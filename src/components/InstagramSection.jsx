import React from 'react';
import styles from './InstagramSection.module.css';

// Sample curated list of Instagram posts/reels.
// Replace the 'id' with the actual Instagram post ID.
// Example URL: https://www.instagram.com/reel/C8_z12345/ -> ID is C8_z12345
// https://www.instagram.com/reel/DJEMrDroUga/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DUDhH9sgcmV/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DLXe9bRhcY-/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
// https://www.instagram.com/reel/DSXUi_8gXcS/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ==
const instagramPosts = [
    { id: 'DJEMrDroUga', type: 'reel' }, // Placeholder IDs
    { id: 'DUDhH9sgcmV', type: 'reel' }, // Placeholder IDs
    { id: 'DLXe9bRhcY-', type: 'reel' },
    { id: 'DSXUi_8gXcS', type: 'reel' },
];

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
                        <div key={post.id} className={styles.postWrapper}>
                            <iframe
                                className={styles.iframe}
                                src={`https://www.instagram.com/${post.type === 'reel' ? 'reel' : 'p'}/${post.id}/embed`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency="true"
                                allow="encrypted-media"
                                title={`Instagram Post ${post.id}`}
                            ></iframe>
                        </div>
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
