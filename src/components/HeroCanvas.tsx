import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCROLL_SEQUENCE_BUCKET } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(0);

  // CHANGED: Reduced frame count to 261
  const totalFrames = 261;
  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${SCROLL_SEQUENCE_BUCKET}/`;

  // Helper to draw a frame to the canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return false;

    const context = canvas.getContext('2d');
    if (!context) return false;

    // Ensure canvas matches its container size
    const container = containerRef.current;
    if (container) {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }

    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
    lastDrawnFrameRef.current = index;
    return true;
  };

  // Progressive Loading & GSAP Logic
  useEffect(() => {
    const loadFrame = (i: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const frameIndex = String(i).padStart(3, '0');
        img.src = `${baseUrl}frame_${frameIndex}.webp`;
        img.onload = () => resolve(img);
        img.onerror = reject;
        imagesRef.current[i] = img;
      });
    };

    // 1. Load Frame 0 immediately
    loadFrame(0).then(() => {
      drawFrame(0);
      
      // 2. Load remaining frames progressively in background
      const loadRemaining = async () => {
        for (let i = 1; i < totalFrames; i++) {
          try {
            await loadFrame(i);
          } catch (e) {
            console.warn(`Failed to load frame ${i}`);
          }
        }
      };
      loadRemaining();
    });

    // 3. GSAP ScrollTrigger Logic
    const playhead = { frame: 0 };
    const scrollAnimation = gsap.to(playhead, {
      frame: totalFrames - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '+=3000',
        scrub: true,
        pin: true,
        onUpdate: () => {
          const targetFrame = Math.round(playhead.frame);
          // Try to draw target frame, fallback to last drawn if not loaded
          if (!drawFrame(targetFrame)) {
            drawFrame(lastDrawnFrameRef.current);
          }
        },
      },
    });

    const handleResize = () => drawFrame(lastDrawnFrameRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      scrollAnimation.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [baseUrl]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-screen overflow-hidden">
      {/* Canvas - Layered at the bottom */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover relative z-0"
      />
      
      {/* Dynamic Theme Tint Overlay (Chameleon Effect) - Layered above canvas */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-color opacity-40 transition-colors duration-500 z-1"
        style={{ backgroundColor: 'var(--accent)' }}
      />
    </div>
  );
}
