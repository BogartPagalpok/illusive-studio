import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { supabase, SCROLL_SEQUENCE_BUCKET } from '../lib/supabase';

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

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Set canvas strictly to the image's native resolution
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw the image cleanly at 1:1 scale
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    lastDrawnFrameRef.current = index;
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
          if (i === 0) {
            drawFrame(0);
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
      
      // Load remaining frames progressively
      for (let i = 1; i < frameCount; i++) {
        if (cancelled) break;
        await loadFrame(i);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [frameCount, filePrefix, fileExtension, drawFrame]);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container || imagesRef.current.length === 0) return;

      const scrollHeight = container.offsetHeight - window.innerHeight;
      const scrolled = -container.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollHeight));
      
      // Double the virtual timeline (e.g., 288 frames * 2 = 576 virtual frames) 
      const totalVirtualFrames = frameCount * 2; 
      
      const virtualFrameIndex = Math.min( 
        Math.floor(progress * totalVirtualFrames), 
        totalVirtualFrames - 1 
      ); 

      // Map virtual index to actual image array (Play forward, then reverse) 
      const frameIndex = virtualFrameIndex < frameCount 
        ? virtualFrameIndex 
        : (totalVirtualFrames - 1) - virtualFrameIndex; 

      if (!drawFrame(frameIndex)) {
        drawFrame(lastDrawnFrameRef.current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [drawFrame, frameCount]);

  return (
    <div ref={containerRef} className="relative w-full bg-black z-0" style={{ height: `${scrollLength * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />
        
        {/* Theme Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none transition-colors duration-500 z-[1]" 
          style={{ backgroundColor: 'var(--accent)', mixBlendMode: 'color', opacity: 0.35 }} 
        />
        
        {/* Bottom Gradient Mask - Adapts to theme background */} 
        <div 
          className="absolute inset-x-0 bottom-0 h-48 md:h-64 pointer-events-none z-[2]" 
          style={{ 
            background: 'linear-gradient(to top, var(--bg-primary, var(--background, #000000)) 0%, transparent 100%)' 
          }} 
        /> 
        
        {/* The Hero Text Content */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
}
