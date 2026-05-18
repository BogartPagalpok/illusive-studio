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
  scrollLength = 4,
  children,
}: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
      return new Promise<void>((resolve) => {
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
      await loadFrame(0);
      for (let i = 1; i < frameCount; i++) {
        if (cancelled) break;
        await loadFrame(i);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [frameCount, filePrefix, fileExtension, drawFrame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container) return;

    const frameObj = { frame: 0 };

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
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
          if (canvas) {
            const fadeStart = 0.85;
            if (self.progress > fadeStart) {
              canvas.style.opacity = `${1 - (self.progress - fadeStart) / (1 - fadeStart)}`;
            } else {
              canvas.style.opacity = '1';
            }
          }
        },
        onLeave: () => {
          if (canvas) canvas.style.opacity = '0';
        },
        onEnterBack: () => {
          if (canvas) canvas.style.opacity = '1';
        },
      });

      return () => st.kill();
    });

    return () => ctx.revert();
  }, [frameCount, drawFrame, scrollLength]);

  return (
    <div ref={containerRef} className="relative w-full bg-black z-0">
      <div className="h-screen w-full overflow-hidden relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />
        
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
