"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceProps {
  frames: string[]; // Your Supabase URLs
  fps?: number;
}

export default function ImageSequence({ frames, fps = 30 }: ImageSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Store decoded image elements
  const imageCache = useRef<HTMLImageElement[]>([]);

  // Step 1: Preload & Decode ALL frames before anything else
  useEffect(() => {
    let cancelled = false;
    const imageElements: HTMLImageElement[] = [];

    const preloadAll = async () => {
      const totalFrames = frames.length;
      
      for (let i = 0; i < totalFrames; i++) {
        if (cancelled) break;
        
        try {
          const img = new Image();
          
          // Critical: Wait for BOTH load AND decode
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              // Force decode immediately (not lazily)
              img.decode()
                .then(() => resolve())
                .catch(() => resolve()); // Fallback if decode fails
            };
            img.onerror = () => {
              console.warn(`Failed to load frame ${i}`);
              resolve(); // Don't block the whole sequence
            };
            img.src = frames[i];
          });
          
          imageElements.push(img);
        } catch (error) {
          console.error(`Frame ${i} error:`, error);
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

  // Step 2: Only set up ScrollTrigger AFTER everything is loaded
  useEffect(() => {
    if (!ready || !containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalFrames = imageCache.current.length;
    if (totalFrames === 0) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2); // Cap at 2x for performance
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Draw first frame immediately
    const drawFrame = (index: number) => {
      const frame = imageCache.current[Math.min(index, totalFrames - 1)];
      if (!frame || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        frame,
        0, 0,
        canvas.width / (window.devicePixelRatio || 1),
        canvas.height / (window.devicePixelRatio || 1)
      );
    };

    drawFrame(0);

    // Step 3: Smooth GSAP animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=300%', // Adjust based on your design
        scrub: 1.2, // Smooth interpolation
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const frameIndex = Math.floor(self.progress * (totalFrames - 1));
          drawFrame(frameIndex);
          setProgress(self.progress);
        },
      },
    });

    return () => {
      tl.kill();
      window.removeEventListener('resize', setCanvasSize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [ready]);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      {/* Progress indicator (optional, good for debugging) */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Loading frames...</p>
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
