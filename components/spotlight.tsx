"use client";

import React, { useRef, useState, useEffect } from "react";
import useMousePosition from "@/utils/useMousePosition";

type SpotlightProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Spotlight({
  children,
  className = "",
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const [boxes, setBoxes] = useState<HTMLElement[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      setBoxes(Array.from(containerRef.current.children) as HTMLElement[]);
    }
  }, []);

  useEffect(() => {
    initContainer();
    window.addEventListener("resize", initContainer);
    return () => window.removeEventListener("resize", initContainer);
  }, [boxes]);
  useEffect(() => {
    onMouseMove();
  }, [mousePosition]);

  const initContainer = () => {
    if (containerRef.current) {
      containerSize.current.w = containerRef.current.offsetWidth;
      containerSize.current.h = containerRef.current.offsetHeight;
    }
  };

  const onMouseMove = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const { w, h } = containerSize.current;
    const x = mousePosition.x - rect.left;
    const y = mousePosition.y - rect.top;
    const inside = x > 0 && x < w && y > 0 && y < h;

    if (!inside) return;

    mouse.current.x = x;
    mouse.current.y = y;

    boxes.forEach((box) => {
      const boxX = -(box.getBoundingClientRect().left - rect.left) + mouse.current.x;
      const boxY = -(box.getBoundingClientRect().top - rect.top) + mouse.current.y;
      box.style.setProperty("--spotlight-x", `${boxX}px`);
      box.style.setProperty("--spotlight-y", `${boxY}px`);
      box.style.setProperty("--spotlight-color", `rgba(96, 165, 250, 0.3)`); // azul claro
    });
  };

  return (
    <div
      ref={containerRef}
      className={`${className} relative [--spotlight-x:0px] [--spotlight-y:0px] [--spotlight-color:rgba(96,165,250,0.3)]`}
      style={{
        backgroundImage:
          "radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 80%)",
        transition: "background 0.2s ease-out",
      }}
    >
      {children}
    </div>
  );
}
