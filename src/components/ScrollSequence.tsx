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
  const innerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(0);
  const firstFrameDrawnRef = useRef<boolean>(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const check = () => { isMobileRef.current = window.innerWidth < 768; };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    if (isMobileRef.current) {
      // Mobile: fill screen then zoom out 30% so face isn't too close
      const fillScale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const scale = fillScale * 0.70;
      const scaledW = img.naturalWidth * scale;
      const scaledH = img.naturalHeight * scale;
      const x = (canvas.width - scaledW) / 2;
      const y = (canvas.height - scaledH) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, scaledW, scaledH);
    } else {
      // Desktop: fill screen (cover) - unchanged
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const x = (canvas.width - img.naturalWidth * scale) / 2;
      const y = (canvas.height - img.naturalHeight * scale) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
    }
    
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
    const inner = innerRef.current;
    if (!container || !inner) return;

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
          
          const fadeStart = 0.75;
          const fadeProgress = Math.max(0, Math.min(1, (self.progress - fadeStart) / (1 - fadeStart)));
          
          inner.style.opacity = `${1 - fadeProgress}`;
          if (canvas) canvas.style.opacity = `${1 - fadeProgress}`;
        },
        onLeave: (self) => {
          inner.style.opacity = '0';
          self.scrollTrigger?.pin(false);
          self.scrollTrigger?.refresh();
        },
        onEnterBack: (self) => {
          inner.style.opacity = '1';
          self.scrollTrigger?.pin(true);
          self.scrollTrigger?.refresh();
        },
      });
    });

    return () => ctx.revert();
  }, [frameCount, drawFrame, scrollLength]);

  return (
    <div ref={containerRef} className="relative w-full z-0">
      <div ref={innerRef} className="h-screen w-full overflow-hidden relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
        
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
