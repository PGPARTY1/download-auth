"use client";

import { useEffect, useRef, useState } from "react";

export function useInView(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: options?.threshold ?? 0.15, rootMargin: options?.rootMargin ?? "0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return { ref, inView };
}
