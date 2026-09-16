import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { supabase, isSupabaseConfigured, SCROLL_SEQUENCE_BUCKET } from '../lib/supabase';
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
  scrollLength = 4,
  children,
}: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(0);
  const firstFrameDrawnRef = useRef<boolean>(false);

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

  useEffect(() => {
    let cancelled = false;

    const loadFrame = (i: number) => {
      return new Promise<boolean>((resolve) => {
        const frameIndex = String(i).padStart(3, '0');
        const { data: urlData } = supabase.storage
          .from(SCROLL_SEQUENCE_BUCKET)
          .getPublicUrl(`${filePrefix}${frameIndex}.${fileExtension}`);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = urlData.publicUrl;
        img.onload = () => {
          if (cancelled) return resolve(false);
          if (!firstFrameDrawnRef.current) {
            drawFrame(i);
            firstFrameDrawnRef.current = true;
          }
          resolve(true);
        };
        img.onerror = () => resolve(false);
        imagesRef.current[i] = img;
      });
    };

    const loadAll = async () => {
      if (!isSupabaseConfigured) return;

      // 1. Await the first frame so the initial canvas paints instantly
      const firstFrameOk = await loadFrame(0);
      if (cancelled || !firstFrameOk) return;

      // 2. Preload initial 15 frames eagerly for smooth initial scroll
      const initialBatch = Math.min(15, frameCount);
      const initialPromises: Promise<boolean>[] = [];
      for (let i = 1; i < initialBatch; i++) {
        initialPromises.push(loadFrame(i));
      }
      await Promise.all(initialPromises);
      if (cancelled) return;

      // 3. Stream remaining frames in small batches of 4 so we don't saturate network
      const BATCH_SIZE = 4;
      for (let i = initialBatch; i < frameCount; i += BATCH_SIZE) {
        if (cancelled) break;
        const batch: Promise<boolean>[] = [];
        for (let j = i; j < Math.min(i + BATCH_SIZE, frameCount); j++) {
          batch.push(loadFrame(j));
        }
        await Promise.all(batch);
        await new Promise((r) => setTimeout(r, 60));
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [frameCount, filePrefix, fileExtension, drawFrame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const frameObj = { frame: 0 };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollLength * 100}%`,
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const target = Math.round(self.progress * (frameCount - 1));
          frameObj.frame = target;
          if (!drawFrame(target)) {
            drawFrame(lastDrawnFrameRef.current);
          }
          
          const fadeStart = 0.75;
          const fadeProgress = Math.max(0, Math.min(1, (self.progress - fadeStart) / (1 - fadeStart)));
          
          inner.style.opacity = `${1 - fadeProgress}`;
          
          if (canvas) {
            canvas.style.opacity = `${1 - fadeProgress}`;
          }
        },
        onLeave: () => {
          inner.style.opacity = '0';
        },
        onEnterBack: () => {
          inner.style.opacity = '1';
        },
      });
    });

    return () => ctx.revert();
  }, [frameCount, drawFrame, scrollLength]);

  return (
    <div ref={containerRef} className="relative w-full z-0">
      <div ref={innerRef} className="h-screen w-full overflow-hidden relative" style={{ backgroundColor: 'var(--hero-bg, #030305)' }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />
        
        <div 
          className="absolute inset-0 pointer-events-none transition-colors duration-500 z-[1]" 
          style={{ 
            backgroundColor: 'var(--hero-tint, var(--accent))', 
            mixBlendMode: 'var(--hero-tint-blend, color)' as any, 
            opacity: 'var(--hero-tint-opacity, 0.35)' as any,
          }} 
        />
        
        <div 
          className="absolute inset-x-0 bottom-0 h-36 md:h-52 pointer-events-none z-[2]" 
          style={{ 
            background: 'linear-gradient(to top, var(--hero-bottom-fade, transparent) 0%, transparent 100%)' 
          }} 
        /> 
        
        <div className="absolute inset-0 z-10 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
}
