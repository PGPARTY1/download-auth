"use client";

import Image from "next/image";
import { useInView } from "./useInView";
import { imageSrc, SHOWCASE_IMAGES } from "./imageSrc";

export function VisualShowcaseSection() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="cinema-showcase"
      aria-label="Visual showcase"
    >
      <div className="cinema-showcase-inner">
        <h2 className={`cinema-showcase-title ${inView ? "cinema-reveal" : ""}`}>
          Visuals
        </h2>
        <div className="cinema-showcase-grid">
          {SHOWCASE_IMAGES.map((filename, i) => (
            <div
              key={filename}
              className="cinema-showcase-item"
              style={{ animationDelay: inView ? `${i * 80}ms` : "0ms" }}
              data-visible={inView}
            >
              <div className="cinema-showcase-card">
                <div className="cinema-showcase-image-wrap">
                  <Image
                    src={imageSrc(filename)}
                    alt=""
                    fill
                    className="cinema-showcase-image"
                    sizes="(max-width: 900px) 100vw, 50vw"
                  />
                  <div className="cinema-showcase-shine" aria-hidden />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
