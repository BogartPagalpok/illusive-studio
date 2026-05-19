import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { supabase, SCROLL_SEQUENCE_BUCKET } from '../lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


interface ScrollSequenceProps {
  frameCount?: number;
  filePrefix?: string;
  fileExtension?: string;
  scrollLength?: number;
  children?: ReactNode;
}

export default function ScrollSequence({
  frameCount = 288,
  filePrefix = 'frame_',
  fileExtension = 'webp',
  scrollLength = 1,
  children,
}: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(0);
  const firstFrameDrawnRef = useRef<boolean>(false);
  const rafIdRef = useRef<number>(0);
  const pendingFrameRef = useRef<number>(-1);
  const tiltXRef = useRef(0);
  const tiltYRef = useRef(0);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    lastDrawnFrameRef.current = index;
    return true;
  }, []);

  // rAF-gated drawing — only one draw per frame
  const scheduleDraw = useCallback((index: number) => {
    pendingFrameRef.current = index;
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = 0;
      const target = pendingFrameRef.current;
      if (target >= 0) {
        if (!drawFrame(target)) {
          drawFrame(lastDrawnFrameRef.current);
        }
      }
    });
  }, [drawFrame]);

  // Parallel batch loading
  useEffect(() => {
    let cancelled = false;

    const loadFrame = (i: number): Promise<void> => {
      return new Promise((resolve) => {
        const frameIndex = String(i).padStart(3, '0');
        const { data: urlData } = supabase.storage
          .from(SCROLL_SEQUENCE_BUCKET)
          .getPublicUrl(`${filePrefix}${frameIndex}.${fileExtension}`);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = urlData.publicUrl;
        img.onload = () => {
          if (cancelled) return resolve();
          if (!firstFrameDrawnRef.current) {
            drawFrame(i);
            firstFrameDrawnRef.current = true;
          }
          resolve();
        };
        img.onerror = () => resolve();
        imagesRef.current[i] = img;
      });
    };

    const loadAll = async () => {
      // Load first frame immediately
      await loadFrame(0);

      // Load remaining in parallel batches of 10
      const batchSize = 10;
      for (let batchStart = 1; batchStart < frameCount; batchStart += batchSize) {
        if (cancelled) break;
        const batch = [];
        for (let i = batchStart; i < Math.min(batchStart + batchSize, frameCount); i++) {
          batch.push(loadFrame(i));
        }
        await Promise.all(batch);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [frameCount, filePrefix, fileExtension, drawFrame]);

  // Mouse-driven 3D tilt
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tiltXRef.current = -y * 6;
      tiltYRef.current = x * 6;

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.transform = `perspective(1200px) rotateX(${tiltXRef.current}deg) rotateY(${tiltYRef.current}deg) scale(1.02)`;
      }
    };

    const handleMouseLeave = () => {
      tiltXRef.current = 0;
      tiltYRef.current = 0;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Scroll-driven frame progression
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const ctx = gsap.context(() => {
      const stInstance = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${scrollLength * 100}%`,
        scrub: true,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const target = Math.round(self.progress * (frameCount - 1));
          scheduleDraw(target);

          const fadeStart = 0.75;
          const fadeProgress = Math.max(0, Math.min(1, (self.progress - fadeStart) / (1 - fadeStart)));
          inner.style.opacity = `${1 - fadeProgress}`;
          if (canvas) {
            canvas.style.opacity = `${1 - fadeProgress}`;
          }
        },
        onLeave: () => {
          inner.style.opacity = '0';
          stInstance.disable();
        },
        onEnterBack: () => {
          inner.style.opacity = '1';
          stInstance.enable();
        },
      });
    });

    return () => ctx.revert();
  }, [frameCount, scheduleDraw, scrollLength]);

  return (
    <div ref={containerRef} className="relative w-full z-0">
      <div ref={innerRef} className="h-screen w-full overflow-hidden relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
        />

        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-500 z-[1]"
          style={{ backgroundColor: 'var(--accent)', mixBlendMode: 'color', opacity: 0.35 }}
        />

        <div
          className="absolute inset-x-0 bottom-0 h-48 md:h-64 pointer-events-none z-[2]"
          style={{
            background: 'linear-gradient(to top, var(--bg-primary, var(--background, #000000)) 0%, transparent 100%)'
          }}
        />

        <div className="absolute inset-0 z-10 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
}
