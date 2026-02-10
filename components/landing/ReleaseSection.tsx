"use client";

import { useInView } from "./useInView";

export function ReleaseSection() {
  const { ref, inView } = useInView({ threshold: 0.3 });

  return (
    <section ref={ref} className="cinema-release" aria-label="Release">
      <div className="cinema-release-inner">
        <p className={`cinema-release-badge ${inView ? "cinema-reveal" : ""}`}>
          Releasing 2027
        </p>
        <p className={`cinema-release-text ${inView ? "cinema-reveal" : ""}`} style={{ transitionDelay: "120ms" }}>
          Downloads and purchase at release.
        </p>
      </div>
    </section>
  );
}
