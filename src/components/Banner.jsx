import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Banner.module.css'

const slide1 = '/assets/marketing/slider1.png'
const slide2 = '/assets/marketing/slider2.png'
const slide3 = '/assets/marketing/slider3.png'

const AUTOPLAY_MS = 4000
const SWIPE_THRESHOLD_PX = 60

/**
 * Mobile banner slide data — inspired by Stitch MCP designs.
 * Each slide has its own gradient, text, and CTA for visual variety.
 */
const mobileBanners = [
  {
    id: 'new-collection',
    gradient: 'linear-gradient(135deg, #5B2333 0%, #8B3A4A 40%, #C9A87C 100%)',
    badge: '✦ HANDCRAFTED IN INDIA',
    heading: 'New Collection',
    subtext: 'Handcrafted with Love',
    cta: 'Shop Now',
    ctaHref: '/products/scrunchie',
    ctaStyle: 'saffron',
    image: slide1,
  },
  {
    id: 'gift-hampers',
    gradient: 'linear-gradient(135deg, #E8C4D8 0%, #D4A8C8 40%, #B8A0D2 100%)',
    badge: '🎁 PERFECT GIFTS',
    heading: 'Gift Something Special',
    subtext: 'Curated hampers for your loved ones',
    cta: 'Explore Hampers',
    ctaHref: '/products/gifthamper',
    ctaStyle: 'rose',
    image: slide2,
  },
  {
    id: 'bestsellers',
    gradient: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 40%, #FDDCBE 100%)',
    badge: '⭐ 1200+ HAPPY CUSTOMERS',
    heading: 'Customer Favourites',
    subtext: 'Loved by our amazing community',
    cta: 'Shop Bestsellers',
    ctaHref: '/products/scrunchie',
    ctaStyle: 'dark',
    image: slide3,
  },
]

export default function Banner() {
  const slides = useMemo(() => [slide1, slide2, slide3], [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef(null)
  const touchStartXRef = useRef(null)
  const touchDeltaXRef = useRef(0)

  // Mobile banner state — separate so it can auto-rotate independently
  const [mobileIndex, setMobileIndex] = useState(0)

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
      setMobileIndex((prev) => (prev + 1) % mobileBanners.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [isPaused, slides.length])

  const goTo = (idx) => setCurrentIndex(((idx % slides.length) + slides.length) % slides.length)
  const goNext = () => goTo(currentIndex + 1)
  const goPrev = () => goTo(currentIndex - 1)

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goNext()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev()
    }
  }

  const onTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX
    touchDeltaXRef.current = 0
  }
  const onTouchMove = (e) => {
    if (touchStartXRef.current == null) return
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current
  }
  const onTouchEnd = () => {
    const delta = touchDeltaXRef.current
    touchStartXRef.current = null
    touchDeltaXRef.current = 0
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    if (delta < 0) {
      setMobileIndex((prev) => (prev + 1) % mobileBanners.length)
      goNext()
    } else {
      setMobileIndex((prev) => (prev - 1 + mobileBanners.length) % mobileBanners.length)
      goPrev()
    }
  }

  const translateXPercent = -(currentIndex * 100)
  const currentBanner = mobileBanners[mobileIndex]

  /** Returns the correct CTA button class based on slide theme */
  const getCtaClass = (style) => {
    if (style === 'saffron') return styles.primaryBtn
    if (style === 'rose') return styles.roseBtn
    return styles.darkBtn
  }

  return (
    <section
      ref={containerRef}
      className={styles.banner}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* ─── DESKTOP CAROUSEL (hidden on mobile via CSS) ─── */}
      <div
        className={styles.track}
        style={{ transform: `translateX(${translateXPercent}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((src, idx) => (
          <div className={styles.slide} key={idx} aria-hidden={idx !== currentIndex}>
            <img className={styles.image} src={src} alt="Promotion" loading="lazy" />
          </div>
        ))}
      </div>

      {/* ─── MOBILE HERO BANNERS (visible only <= 767px via CSS) ─── */}
      <div
        className={styles.mobileHeroOverlay}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Background: product image with gradient overlay */}
        <div className={styles.kenBurnsBg}>
          <img src={currentBanner.image} alt="Hero product" className={styles.heroImg} />
        </div>

        {/* Gradient color wash over the image for each theme */}
        <div
          className={styles.gradientWash}
          style={{ background: currentBanner.gradient, opacity: 0.85 }}
        />

        <div className={styles.heroContent}>
          <div className={styles.topSection}>
            <span className={styles.brandBadge}>{currentBanner.badge}</span>
          </div>

          <div className={styles.middleSection}>
            <h1
              className={styles.headline}
              /* Dark text for light-background slides */
              style={currentBanner.ctaStyle === 'dark' ? { color: '#3D2C2C' } : undefined}
            >
              <span className={styles.line1}>{currentBanner.heading}</span>
            </h1>
            <p
              className={styles.heroSubtitle}
              style={currentBanner.ctaStyle === 'dark' ? { color: '#5B4545' } : undefined}
            >
              {currentBanner.subtext}
            </p>
          </div>

          <div className={styles.bottomSection}>
            <button className={getCtaClass(currentBanner.ctaStyle)}>
              {currentBanner.cta}
            </button>

            {/* Dot indicators */}
            <div className={styles.mobileDots}>
              {mobileBanners.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.mobileDot} ${idx === mobileIndex ? styles.mobileDotActive : ''}`}
                  onClick={() => setMobileIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className={styles.prev} onClick={goPrev} aria-label="Previous slide">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button className={styles.next} onClick={goNext} aria-label="Next slide">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  )
}