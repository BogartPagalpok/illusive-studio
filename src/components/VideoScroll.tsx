import { useEffect, useRef, ReactNode } from 'react';

interface VideoScrollProps {
  videoUrl: string;
  children?: ReactNode;
}

export default function VideoScroll({ videoUrl, children }: VideoScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});

    const loop = () => {
      if (video.ended) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('ended', loop);
    return () => video.removeEventListener('ended', loop);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full z-0 bg-black">
      <div className="h-screen w-full overflow-hidden relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover z-0"
          muted
          playsInline
          preload="auto"
          loop
        />
        <div 
          className="absolute inset-0 pointer-events-none z-[1]" 
          style={{ backgroundColor: 'var(--accent)', mixBlendMode: 'color', opacity: 0.35 }} 
        />
        <div 
          className="absolute inset-x-0 bottom-0 h-48 md:h-64 pointer-events-none z-[2]" 
          style={{ background: 'linear-gradient(to top, var(--bg-primary, var(--background, #000000)) 0%, transparent 100%)' }} 
        /> 
        <div className="absolute inset-0 z-10 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
}
