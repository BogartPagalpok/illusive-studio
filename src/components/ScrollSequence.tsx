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

  const requestedFramesRef = useRef<Set<number>>(new Set());

  const loadFrame = useCallback((i: number) => {
    if (i < 0 || i >= frameCount) return Promise.resolve();
    if (requestedFramesRef.current.has(i)) return Promise.resolve();
    requestedFramesRef.current.add(i);

    return new Promise<void>((resolve) => {
      const frameIndex = String(i).padStart(3, '0');
      const { data: urlData } = supabase.storage
        .from(SCROLL_SEQUENCE_BUCKET)
        .getPublicUrl(`${filePrefix}${frameIndex}.${fileExtension}`);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = urlData.publicUrl;
      img.onload = () => {
        if (!firstFrameDrawnRef.current) {
          drawFrame(i);
          firstFrameDrawnRef.current = true;
        }
        resolve();
      };
      img.onerror = () => resolve();
      imagesRef.current[i] = img;
    });
  }, [frameCount, filePrefix, fileExtension, drawFrame]);

  const preloadWindow = useCallback((currentFrame: number, lookahead: number = 10) => {
    const start = Math.max(0, currentFrame - 2);
    const end = Math.min(frameCount - 1, currentFrame + lookahead);
    for (let i = start; i <= end; i++) {
      if (!imagesRef.current[i] && !requestedFramesRef.current.has(i)) {
        loadFrame(i);
      }
    }
  }, [frameCount, loadFrame]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // 1. Await the first frame so the initial canvas paints instantly
      await loadFrame(0);
      if (cancelled) return;

      // 2. Preload only an initial lookahead buffer of 5 frames (not all 288!)
      for (let i = 1; i <= 5 && i < frameCount; i++) {
        if (cancelled) break;
        loadFrame(i);
      }

      // 3. Low-priority background idle loader for subsequent frames
      let nextIdleFrame = 6;
      const loadIdleChunk = () => {
        if (cancelled || nextIdleFrame >= frameCount) return;
        const chunkEnd = Math.min(nextIdleFrame + 4, frameCount);
        for (let i = nextIdleFrame; i < chunkEnd; i++) {
          if (!requestedFramesRef.current.has(i)) {
            loadFrame(i);
          }
        }
        nextIdleFrame = chunkEnd;
        if (nextIdleFrame < frameCount) {
          setTimeout(loadIdleChunk, 300);
        }
      };

      setTimeout(loadIdleChunk, 1500);
    };

    init();
    return () => { cancelled = true; };
  }, [frameCount, loadFrame]);

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
          preloadWindow(target, 12);
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
