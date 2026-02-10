"use client";

import Image from "next/image";
import { useScrollPosition } from "./useScrollPosition";
import { imageSrc, HERO_IMAGE } from "./imageSrc";

function scrollToNext() {
  const next = document.querySelector("[data-section='game-presence']");
  next?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  const scrollY = useScrollPosition();
  const parallaxY = scrollY * 0.35;

  return (
    <section className="cinema-hero" aria-label="Hero">
      <div className="cinema-hero-media">
        <div
          className="cinema-hero-image-wrap"
          style={{ transform: `translate3d(0, ${parallaxY}px, 0) scale(1.08)` }}
        >
          <Image
            src={imageSrc(HERO_IMAGE)}
            alt=""
            fill
            className="cinema-hero-image"
            priority
            sizes="100vw"
          />
        </div>
        <div className="cinema-hero-overlay" />
        <div className="cinema-hero-glow" aria-hidden />
      </div>
      <div className="cinema-hero-content">
        <h1 className="cinema-hero-title">PookieStudios</h1>
        <p className="cinema-hero-tagline">Coming 2027</p>
        <button
          type="button"
          className="cinema-hero-scroll"
          onClick={scrollToNext}
          aria-label="Scroll to explore"
        >
          <span className="cinema-hero-scroll-text">Scroll</span>
          <span className="cinema-hero-scroll-icon" aria-hidden />
        </button>
      </div>
    </section>
  );
}
