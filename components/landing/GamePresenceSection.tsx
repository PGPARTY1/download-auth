"use client";

import Image from "next/image";
import { useInView } from "./useInView";
import { imageSrc, PRESENCE_IMAGE } from "./imageSrc";

export function GamePresenceSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      data-section="game-presence"
      className="cinema-presence"
      aria-label="Game presence"
    >
      <div className="cinema-presence-bg">
        <Image
          src={imageSrc(PRESENCE_IMAGE)}
          alt=""
          fill
          className="cinema-presence-image"
          sizes="100vw"
        />
        <div className="cinema-presence-overlay" />
      </div>
      <div className={`cinema-presence-content ${inView ? "cinema-reveal" : ""}`}>
        <h2 className="cinema-presence-title">A world in the making</h2>
        <p className="cinema-presence-tagline">Story. World. Gameplay. 2027.</p>
      </div>
    </section>
  );
}
