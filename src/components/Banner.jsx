import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Banner.module.css'

import slide1 from '../assets/Marketing/slider1.png'
import slide2 from '../assets/Marketing/slider2.png'
import slide3 from '../assets/Marketing/slider3.png'

const AUTOPLAY_MS = 4000
const SWIPE_THRESHOLD_PX = 60

export default function Banner() {
  const slides = useMemo(() => [slide1, slide2, slide3], [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef(null)
  const touchStartXRef = useRef(null)
  const touchDeltaXRef = useRef(0)

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
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
    if (delta < 0) goNext()
    else goPrev()
  }

  const translateXPercent = -(currentIndex * 100)

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

      <button className={styles.prev} onClick={goPrev} aria-label="Previous slide">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button className={styles.next} onClick={goNext} aria-label="Next slide">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* <div className={styles.dots} role="tablist" aria-label="Slide selector">
        {slides.map((_, idx) => (
          <button
            key={idx}
            role="tab"
            aria-selected={idx === currentIndex}
            aria-label={`Go to slide ${idx + 1}`}
            className={idx === currentIndex ? `${styles.dot} ${styles.activeDot}` : styles.dot}
            onClick={() => goTo(idx)}
          />
        ))}
      </div> */}
    </section>
  )
}