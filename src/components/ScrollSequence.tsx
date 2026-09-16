import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { heroSequenceCache, TOTAL_FRAMES } from '../lib/heroSequenceCache';
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
  frameCount = TOTAL_FRAMES,
  scrollLength = 4,
  children,
}: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const lastDrawnFrameRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const img = heroSequenceCache.images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    lastDrawnFrameRef.current = index;
    return true;
  }, []);

  // Connect to the shared preloaded frame cache so frames load instantly without network stalls
  useEffect(() => {
    heroSequenceCache.startPreload();

    const checkAndDraw = () => {
      const target = Math.round(currentProgressRef.current * (frameCount - 1));
      const nearest = heroSequenceCache.getNearestFrame(target, lastDrawnFrameRef.current);
      drawFrame(nearest);
    };

    // Draw initial frame immediately
    checkAndDraw();

    const unsubscribe = heroSequenceCache.subscribe(() => {
      checkAndDraw();
    });

    return () => {
      unsubscribe();
    };
  }, [frameCount, drawFrame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollLength * 100}%`,
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          currentProgressRef.current = self.progress;
          const target = Math.round(self.progress * (frameCount - 1));
          const frameToDraw = heroSequenceCache.getNearestFrame(target, lastDrawnFrameRef.current);
          drawFrame(frameToDraw);
          
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
