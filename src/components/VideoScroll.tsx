import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface VideoScrollProps {
  videoUrl: string;
  scrollLength?: number;
  children?: ReactNode;
}

export default function VideoScroll({
  videoUrl,
  scrollLength = 2,
  children,
}: VideoScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    // Wait for video metadata to load
    const initScroll = () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: `+=${scrollLength * 100}%`,
          scrub: true,
          pin: true,
          onUpdate: (self) => {
            if (video.duration && video.readyState >= 2) {
              video.currentTime = self.progress * video.duration;
            }
          },
        });
      });

      return () => ctx.revert();
    };

    if (video.readyState >= 2) {
      initScroll();
    } else {
      video.addEventListener('loadedmetadata', initScroll, { once: true });
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [scrollLength]);

  return (
    <div ref={containerRef} className="relative w-full z-0 bg-black">
      <div className="h-screen w-full overflow-hidden relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover z-0"
          muted
          playsInline
          preload="metadata"
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
