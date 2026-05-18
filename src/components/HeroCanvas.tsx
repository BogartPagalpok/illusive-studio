import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCROLL_SEQUENCE_BUCKET } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const totalFrames = 262;
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${SCROLL_SEQUENCE_BUCKET}/`;

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return false;

    const context = canvas.getContext('2d');
    if (!context) return false;

    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
    lastDrawnFrameRef.current = index;
    return true;
  }, []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      drawFrame(lastDrawnFrameRef.current);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [ready, drawFrame]);

  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];

    const loadAll = async () => {
      for (let i = 0; i < totalFrames; i++) {
        if (cancelled) break;
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            const frameIndex = String(i).padStart(3, '0');
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = `${baseUrl}frame_${frameIndex}.webp`;
          });
          imgs[i] = img;
          setLoadProgress((i + 1) / totalFrames);
        } catch {
          setLoadProgress((i + 1) / totalFrames);
        }
      }
      if (!cancelled) {
        imagesRef.current = imgs;
        setReady(true);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (ready) drawFrame(0);
  }, [ready, drawFrame]);

  useEffect(() => {
    if (!ready) return;

    const playhead = { frame: 0 };
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const scrollAnimation = gsap.to(playhead, {
      frame: totalFrames - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '+=1500',
        scrub: 0.3,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const targetFrame = Math.round(playhead.frame);
          if (!drawFrame(targetFrame)) drawFrame(lastDrawnFrameRef.current);

          // Diagonal mask — wipes from top-left to bottom-right
          if (canvas && container) {
            const fadeStart = 0.80;
            const fadeProgress = Math.max(0, Math.min(1, (self.progress - fadeStart) / (1 - fadeStart)));
            const fadePoint = fadeProgress * 120;
            const visibleArea = Math.max(0, 100 - fadePoint);
            const start = Math.max(0, visibleArea - 20);
            const middle = visibleArea;
            const end = Math.min(120, visibleArea + 40);
            
            const maskImage = `linear-gradient(135deg, 
              rgba(0,0,0,1) 0%, 
              rgba(0,0,0,1) ${start}%, 
              rgba(0,0,0,0.5) ${middle}%, 
              rgba(0,0,0,0) ${end}%)`;
            
            canvas.style.maskImage = maskImage;
            canvas.style.WebkitMaskImage = maskImage;
            canvas.style.maskComposite = 'intersect';
            canvas.style.WebkitMaskComposite = 'intersect';
          }
        },
        onLeave: () => {
          if (canvas) {
            canvas.style.maskImage = 'none';
            canvas.style.WebkitMaskImage = 'none';
            canvas.style.opacity = '0';
          }
        },
        onEnterBack: () => {
          if (canvas) {
            canvas.style.maskImage = 'none';
            canvas.style.WebkitMaskImage = 'none';
            canvas.style.opacity = '1';
          }
        },
      },
    });

    return () => {
      scrollAnimation.kill();
    };
  }, [ready, drawFrame]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover relative z-0"
        style={{ opacity: ready ? 1 : 0 }}
      />
      <div
        className="absolute inset-0 pointer-events-none mix-blend-color opacity-40 transition-colors duration-500 z-1"
        style={{ backgroundColor: 'var(--accent)' }}
      />
      {!ready && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em] text-white">
            IAN<span className="text-white/40">.</span>LESTER
          </h1>
          <div className="mt-8 w-48 md:w-64 h-[1px] bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${Math.round(loadProgress * 100)}%` }}
            />
          </div>
          <p className="mt-4 text-white/30 text-xs tracking-[0.3em] uppercase">
            {Math.round(loadProgress * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}
