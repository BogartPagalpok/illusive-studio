"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

// Same presets as the Framer component
const PRESETS = {
  Default: {
    perspective: 1000,
    rotateY: 45,
    depth: 150,
    activeScale: 1,
    inactiveScale: 0.85,
    inactiveOpacity: 0.5,
    snapDuration: 0.6,
    snapEase: "power3.out",
  },
  "Flat Minimal": {
    perspective: 1000,
    rotateY: 0,
    depth: 0,
    activeScale: 1,
    inactiveScale: 0.9,
    inactiveOpacity: 0.4,
    snapDuration: 0.5,
    snapEase: "power2.out",
  },
  "Deep 3D": {
    perspective: 800,
    rotateY: 65,
    depth: 300,
    activeScale: 1.05,
    inactiveScale: 0.7,
    inactiveOpacity: 0.3,
    snapDuration: 0.8,
    snapEase: "power4.out",
  },
  "Soft Cover": {
    perspective: 1200,
    rotateY: 30,
    depth: 80,
    activeScale: 1,
    inactiveScale: 0.92,
    inactiveOpacity: 0.6,
    snapDuration: 0.7,
    snapEase: "power3.out",
  },
  "Elastic Pop": {
    perspective: 900,
    rotateY: 40,
    depth: 200,
    activeScale: 1.1,
    inactiveScale: 0.75,
    inactiveOpacity: 0.4,
    snapDuration: 0.8,
    snapEase: "elastic.out(1,0.5)",
  },
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
];

export default function DraggableCarousel({
  images = FALLBACK_IMAGES,
  slideWidth = 320,
  slideHeight = 400,
  gap = 20,
  borderRadius = 12,
  objectFit = "cover",
  preset = "Default",
  perspective: customPerspective,
  rotateY: customRotateY,
  depth: customDepth,
  activeScale: customActiveScale,
  inactiveScale: customInactiveScale,
  inactiveOpacity: customInactiveOpacity,
  snapDuration: customSnapDuration,
  snapEase: customSnapEase,
  showArrows = true,
  arrowColor = "#333333",
  arrowSize = 44,
  showDots = true,
  dotColor = "#333333",
  dotSize = 8,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const slidesRef = useRef([]);
  const autoplayRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);
  const trackX = useRef(0);
  const drag = useRef({
    active: false,
    startX: 0,
    startTrackX: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  // Use preset values if not custom overridden
  const presetData = preset !== "Custom" ? PRESETS[preset] : null;
  const perspective = presetData?.perspective ?? customPerspective ?? 1000;
  const maxRotateY = presetData?.rotateY ?? customRotateY ?? 45;
  const depth = presetData?.depth ?? customDepth ?? 150;
  const activeScale = presetData?.activeScale ?? customActiveScale ?? 1;
  const inactiveScale = presetData?.inactiveScale ?? customInactiveScale ?? 0.85;
  const inactiveOpacity = presetData?.inactiveOpacity ?? customInactiveOpacity ?? 0.5;
  const snapDuration = presetData?.snapDuration ?? customSnapDuration ?? 0.6;
  const snapEase = presetData?.snapEase ?? customSnapEase ?? "power3.out";

  const slides = images?.length > 0 ? images : FALLBACK_IMAGES;
  const count = slides.length;
  const step = slideWidth + gap;

  const centerXFor = useCallback(
    (i) => {
      const el = containerRef.current;
      if (!el) return -i * step;
      return el.offsetWidth / 2 - i * step - slideWidth / 2;
    },
    [step, slideWidth]
  );

  // Apply 3D transforms to each slide based on current trackX
  const render = useCallback(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    track.style.transform = `translateX(${trackX.current}px)`;
    const center = el.offsetWidth / 2;
    slidesRef.current.forEach((slide, i) => {
      if (!slide) return;
      const slideCenter = i * step + slideWidth / 2 + trackX.current;
      const norm = (slideCenter - center) / step;
      const abs = Math.abs(norm);
      const ry = norm * maxRotateY;
      const tz = -abs * depth;
      const sc = Math.max(inactiveScale, activeScale - abs * (activeScale - inactiveScale));
      const op = Math.max(inactiveOpacity, 1 - abs * (1 - inactiveOpacity));
      slide.style.transform = `perspective(${perspective}px) rotateY(${ry}deg) translateZ(${tz}px) scale(${sc})`;
      slide.style.opacity = op;
      slide.style.zIndex = 100 - Math.round(abs * 10);
    });
  }, [step, slideWidth, maxRotateY, depth, activeScale, inactiveScale, inactiveOpacity, perspective]);

  const snapTo = useCallback(
    (i, instant = false) => {
      const target = loop ? ((i % count) + count) % count : Math.max(0, Math.min(count - 1, i));
      const x = centerXFor(target);
      if (instant) {
        trackX.current = x;
        render();
        indexRef.current = target;
        setActiveIndex(target);
        return;
      }
      indexRef.current = target;
      setActiveIndex(target);
      gsap.killTweensOf(trackX);
      gsap.to(trackX, {
        current: x,
        duration: snapDuration,
        ease: snapEase,
        onUpdate: render,
      });
    },
    [centerXFor, count, loop, snapDuration, snapEase, render]
  );

  // Initialize slide refs array and snap to first slide
  useEffect(() => {
    slidesRef.current = slidesRef.current.slice(0, count);
    snapTo(0, true);
  }, [count, slideWidth, gap, snapTo]);

  // Drag interaction
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onStart = (e) => {
      gsap.killTweensOf(trackX);
      drag.current.active = true;
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      drag.current.startX = x;
      drag.current.startTrackX = trackX.current;
      drag.current.lastX = x;
      drag.current.lastTime = Date.now();
      drag.current.velocity = 0;
      container.style.cursor = "grabbing";
    };

    const onMove = (e) => {
      if (!drag.current.active) return;
      if (e.cancelable) e.preventDefault();
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const now = Date.now();
      const dt = now - drag.current.lastTime;
      if (dt > 0) {
        drag.current.velocity = ((x - drag.current.lastX) / dt) * 1000;
      }
      drag.current.lastX = x;
      drag.current.lastTime = now;
      trackX.current = drag.current.startTrackX + (x - drag.current.startX);
      render();
    };

    const onEnd = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      container.style.cursor = "grab";

      const projected = trackX.current + drag.current.velocity * 0.12;
      const center = container.offsetWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < count; i++) {
        const sc = i * step + slideWidth / 2 + projected;
        const d = Math.abs(sc - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      snapTo(best);
    };

    container.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    container.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    return () => {
      container.removeEventListener("mousedown", onStart);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      container.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [count, step, slideWidth, render, snapTo]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || count <= 1) return;
    const tick = () => {
      const next = indexRef.current + 1;
      if (!loop && next >= count) snapTo(0);
      else snapTo(next);
    };
    const start = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(tick, autoplayDelay);
    };
    const stop = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
    start();
    const container = containerRef.current;
    if (container && pauseOnHover) {
      container.addEventListener("mouseenter", stop);
      container.addEventListener("mouseleave", start);
    }
    return () => {
      stop();
      if (container && pauseOnHover) {
        container.removeEventListener("mouseenter", stop);
        container.removeEventListener("mouseleave", start);
      }
    };
  }, [autoplay, autoplayDelay, pauseOnHover, loop, count, snapTo]);

  // Re-render if visual props change
  useEffect(() => {
    render();
  }, [maxRotateY, depth, activeScale, inactiveScale, inactiveOpacity, perspective, borderRadius]);

  const goPrev = () => snapTo(indexRef.current - 1);
  const goNext = () => snapTo(indexRef.current + 1);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        cursor: "grab",
        userSelect: "none",
        position: "relative",
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: gap,
          alignItems: "center",
        }}
      >
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            ref={(el) => {
              slidesRef.current[i] = el;
            }}
            style={{
              width: slideWidth,
              height: slideHeight,
              borderRadius: borderRadius,
              overflow: "hidden",
              flexShrink: 0,
              willChange: "transform, opacity",
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: objectFit,
                display: "block",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Arrows */}
      {showArrows && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: 12,
              zIndex: 200,
              width: arrowSize,
              height: arrowSize,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <svg
              width={arrowSize * 0.45}
              height={arrowSize * 0.45}
              viewBox="0 0 24 24"
              fill="none"
              stroke={arrowColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Next slide"
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              right: 12,
              zIndex: 200,
              width: arrowSize,
              height: arrowSize,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <svg
              width={arrowSize * 0.45}
              height={arrowSize * 0.45}
              viewBox="0 0 24 24"
              fill="none"
              stroke={arrowColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            zIndex: 200,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => snapTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: dotColor,
                opacity: i === activeIndex ? 1 : 0.3,
                transform: i === activeIndex ? "scale(1.4)" : "scale(1)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
