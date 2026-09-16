import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface TimelineSectionItem {
  id: string;
  watermark?: string;
  fullBleed?: boolean;
  content: React.ReactNode;
}

interface CinematicTimelineProps {
  sections: TimelineSectionItem[];
}

export default function CinematicTimeline({ sections }: CinematicTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [timecode, setTimecode] = useState('00:00:01:00');

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update live DaVinci timecode based on scroll progress
  const updateTimecode = useCallback((progress: number) => {
    const totalFrames = Math.floor(progress * 2400); // 100 seconds @ 24fps
    const hours = String(Math.floor(totalFrames / (24 * 3600))).padStart(2, '0');
    const minutes = String(Math.floor((totalFrames % (24 * 3600)) / (24 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((totalFrames % (24 * 60)) / 24)).padStart(2, '0');
    const frames = String(totalFrames % 24).padStart(2, '0');
    setTimecode(`${hours}:${minutes}:${seconds}:${frames}`);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || !isDesktop) return;

    const ctx = gsap.context(() => {
      // Calculate exact pixel width difference so the end stops perfectly flush
      const getScrollDistance = () => track.scrollWidth - window.innerWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${getScrollDistance() * 1.15}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updateTimecode(self.progress);
          },
        },
      });

      // Master horizontal track animation
      tl.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
      });

      // Parallax background watermarks
      gsap.utils.toArray<HTMLElement>('.timeline-watermark').forEach((el) => {
        tl.to(
          el,
          {
            x: -160,
            ease: 'none',
          },
          0
        );
      });

      triggerRef.current = tl.scrollTrigger || null;
    }, container);

    // Global listener for navbar and anchor links to glide smoothly along the horizontal timeline
    const handleNavClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.replace('#', '');

      const targetEl = document.getElementById(id);
      if (targetEl && triggerRef.current && trackRef.current) {
        e.preventDefault();
        e.stopPropagation();

        const st = triggerRef.current;
        const totalDist = trackRef.current.scrollWidth - window.innerWidth;
        if (totalDist <= 0) return;

        // Find target relative left offset inside track
        const targetOffset = targetEl.getBoundingClientRect().left - trackRef.current.getBoundingClientRect().left;
        const progress = Math.max(0, Math.min(1, targetOffset / totalDist));
        const targetScrollY = st.start + progress * (st.end - st.start);

        if (window.__lenis) {
          window.__lenis.scrollTo(targetScrollY, { duration: 1.2 });
        } else {
          window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleNavClick, true);

    return () => {
      ctx.revert();
      triggerRef.current = null;
      document.removeEventListener('click', handleNavClick, true);
    };
  }, [isDesktop, updateTimecode, sections]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Cinematic Director's Timecode HUD (Floating subtly at top-right under navbar on desktop) */}
      {isDesktop && (
        <div className="fixed top-24 right-8 z-40 pointer-events-none select-none hidden xl:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="font-mono text-xs font-bold tracking-widest text-white/90 uppercase">
            REC ● {timecode}
          </span>
          <span className="text-white/20">|</span>
          <span className="font-mono text-[10px] text-accent tracking-wider font-semibold">
            4K DCI // 24FPS
          </span>
        </div>
      )}

      {/* Main Track: Desktop = Full-Screen Horizontal Ribbon; Mobile = Natural Vertical Stack */}
      <div
        className={
          isDesktop
            ? "relative w-full h-screen overflow-hidden bg-transparent"
            : "relative w-full flex flex-col bg-transparent"
        }
      >
        <div
          ref={trackRef}
          className={
            isDesktop
              ? "flex flex-row h-full will-change-transform select-none"
              : "flex flex-col w-full"
          }
          style={isDesktop ? { width: 'max-content' } : undefined}
        >
          {sections.map((sec, idx) => (
            <div
              key={sec.id || idx}
              id={sec.id}
              className={
                isDesktop
                  ? `h-screen shrink-0 relative flex flex-col justify-center items-center ${
                      sec.fullBleed
                        ? "w-screen overflow-hidden"
                        : "w-screen max-w-[100vw] px-6 sm:px-12 lg:px-16 overflow-y-auto overflow-x-hidden scrollbar-none"
                    }`
                  : "w-full min-h-screen relative flex flex-col justify-center items-center px-4 sm:px-6 py-12"
              }
              style={isDesktop ? { width: '100vw', height: '100vh' } : undefined}
            >
              {/* Parallax Outlined Chapter Watermark (Mad Dogs & Obys Agency aesthetic) */}
              {isDesktop && sec.watermark && (
                <div
                  className="timeline-watermark absolute inset-x-0 bottom-6 pointer-events-none select-none text-center opacity-10 font-heading font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11vw] tracking-tighter uppercase whitespace-nowrap overflow-visible z-0 will-change-transform"
                  style={{
                    WebkitTextStroke: '1px rgba(255, 255, 255, 0.4)',
                    color: 'transparent',
                  }}
                >
                  {sec.watermark}
                </div>
              )}

              {/* Section Content */}
              <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
                {sec.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
