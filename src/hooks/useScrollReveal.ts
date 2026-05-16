"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceProps {
  frames: string[];
}

export default function ImageSequence({ frames }: ImageSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const imageCache = useRef<HTMLImageElement[]>([]);

  // Preload & decode all frames
  useEffect(() => {
    let cancelled = false;
    const imageElements: HTMLImageElement[] = [];
    const total = frames.length;

    const preloadAll = async () => {
      for (let i = 0; i < total; i++) {
        if (cancelled) break;

        try {
          const img = new Image();

          await new Promise<void>((resolve) => {
            img.onload = () => {
              img.decode()
                .then(() => resolve())
                .catch(() => resolve());
            };
            img.onerror = () => resolve();
            img.src = frames[i];
          });

          imageElements.push(img);
          setLoadProgress((i + 1) / total);
        } catch {
          setLoadProgress((i + 1) / total);
        }
      }

      if (!cancelled) {
        imageCache.current = imageElements;
        setReady(true);
      }
    };

    preloadAll();

    return () => {
      cancelled = true;
    };
  }, [frames]);

  // Setup ScrollTrigger animation
  useEffect(() => {
    if (!ready) return;
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalFrames = imageCache.current.length;
    if (totalFrames === 0) return;

    const setCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const drawFrame = (index: number) => {
      const frame = imageCache.current[Math.min(index, totalFrames - 1)];
      if (!frame) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frame, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    };

    drawFrame(0);

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=300%',
      scrub: 1.2,
      pin: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const frameIndex = Math.floor(self.progress * (totalFrames - 1));
        drawFrame(frameIndex);
      },
    });

    return () => {
      st.kill();
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [ready]);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      {/* Branded Loading Screen */}
      {!ready && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-8">
            {/* Logo */}
            <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em] text-white">
              IAN<span className="text-white/40">.</span>LESTER
            </h1>

            {/* Loading bar */}
            <div className="w-48 md:w-64 h-[1px] bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${Math.round(loadProgress * 100)}%` }}
              />
            </div>

            {/* Frame counter */}
            <p className="text-white/30 text-xs tracking-[0.3em] uppercase">
              {Math.round(loadProgress * 100)}%
            </p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
