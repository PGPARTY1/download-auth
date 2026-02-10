"use client";

import Link from "next/link";
import { useInView } from "./useInView";

export function PlansSection() {
  const { ref, inView } = useInView({ threshold: 0.15 });

  return (
    <section ref={ref} className="cinema-plans" aria-label="Plans">
      <div className="cinema-plans-inner">
        <h2 className={`cinema-plans-heading ${inView ? "cinema-reveal" : ""}`}>
          Plans
        </h2>
        <p className={`cinema-plans-intro ${inView ? "cinema-reveal" : ""}`} style={{ transitionDelay: "80ms" }}>
          Available at release (2027)
        </p>
        <div className="cinema-plans-panels">
          <article
            className="cinema-panel"
            data-visible={inView}
            style={{ transitionDelay: "160ms" }}
          >
            <div className="cinema-panel-border" aria-hidden />
            <div className="cinema-panel-glow" aria-hidden />
            <h3 className="cinema-panel-name">BASE</h3>
            <p className="cinema-panel-tagline">Best for players who want story & graphics</p>
            <p className="cinema-panel-price">₹669 / $9.99</p>
            <p className="cinema-panel-note">One-time payment (future)</p>
            <ul className="cinema-panel-features">
              <li>Core game content & story</li>
              <li>Single-player experience</li>
              <li>Future updates</li>
            </ul>
            <p className="cinema-panel-coming">
              <span className="cinema-panel-coming-pulse">Coming 2027</span>
            </p>
          </article>
          <article
            className="cinema-panel"
            data-visible={inView}
            style={{ transitionDelay: "240ms" }}
          >
            <div className="cinema-panel-border" aria-hidden />
            <div className="cinema-panel-glow" aria-hidden />
            <h3 className="cinema-panel-name">FULL</h3>
            <p className="cinema-panel-tagline">Best for players who want a little extra</p>
            <p className="cinema-panel-price">₹849 / $14.99</p>
            <p className="cinema-panel-note">One-time payment (future)</p>
            <ul className="cinema-panel-features">
              <li>Everything in BASE</li>
              <li>Multiplayer</li>
              <li>DLCs</li>
              <li>Early access perks</li>
            </ul>
            <p className="cinema-panel-coming">
              <span className="cinema-panel-coming-pulse">Coming 2027</span>
            </p>
          </article>
        </div>
        <p className={`cinema-plans-cta-wrap ${inView ? "cinema-reveal" : ""}`} style={{ transitionDelay: "320ms" }}>
          <Link href="/download" className="cinema-plans-cta">
            Enter download
          </Link>
        </p>
      </div>
    </section>
  );
}
