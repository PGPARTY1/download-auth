"use client";

import { useEffect, useRef, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const raf = useRef<number>(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
        setVisible(true);
      });
    };
    const handleLeave = () => setVisible(false);
    window.addEventListener("mousemove", handleMove, { passive: true });
    document.body.addEventListener("mouseleave", handleLeave);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", handleMove);
      document.body.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      className="cursor-glow"
      aria-hidden
      style={{
        left: pos.x,
        top: pos.y,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
