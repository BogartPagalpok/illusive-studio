import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export interface SlideItem {
  id: string;
  title: string;
  category?: string;
  fullBleed?: boolean;
  content: React.ReactNode;
}

interface SlideshowDeckProps {
  slides: SlideItem[];
}

export default function SlideshowDeck({ slides }: SlideshowDeckProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = slides.length;

  const goToSlide = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(totalSlides - 1, idx));
    setCurrentSlide(clamped);

    if (triggerRef.current && isDesktop) {
      const st = triggerRef.current;
      const targetY = st.start + (st.end - st.start) * (clamped / (totalSlides - 1));
      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { duration: 1.0 });
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    } else {
      const targetEl = document.getElementById(slides[clamped]?.id);
      if (targetEl) {
        if (window.__lenis) {
          window.__lenis.scrollTo(targetEl, { duration: 1.0 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [totalSlides, isDesktop, slides]);

  // Master GSAP Horizontal Scroll Timeline (Active on Desktop)
  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track || !isDesktop || totalSlides <= 1) return;

    const ctx = gsap.context(() => {
      const scrollDistance = (totalSlides - 1) * window.innerHeight * 1.1;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (totalSlides - 1),
            duration: 0.5,
            ease: 'power2.out',
            delay: 0.1,
          },
          onUpdate: (self) => {
            const slideIdx = Math.min(totalSlides - 1, Math.round(self.progress * (totalSlides - 1)));
            setCurrentSlide(slideIdx);
          },
        },
      });

      tl.to(track, {
        xPercent: -100 * (totalSlides - 1),
        ease: 'none',
      });

      triggerRef.current = tl.scrollTrigger || null;
    }, stage);

    // Global listener so nav clicks jump to the slide on the timeline
    const handleGlobalNavClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;
      const id = href.replace('#', '');
      const matchIdx = slides.findIndex((s) => s.id === id || s.id.startsWith(id));
      if (matchIdx !== -1) {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(matchIdx);
      }
    };

    document.addEventListener('click', handleGlobalNavClick, true);

    return () => {
      ctx.revert();
      triggerRef.current = null;
      document.removeEventListener('click', handleGlobalNavClick, true);
    };
  }, [isDesktop, totalSlides, slides, goToSlide]);

  // Keyboard navigation: ArrowLeft / ArrowRight / PageUp / PageDown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in form inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, goToSlide]);

  return (
    <div className="relative w-full">
      {/* Pinned Stage */}
      <div
        ref={stageRef}
        className={
          isDesktop
            ? "relative w-full h-screen overflow-hidden bg-transparent"
            : "relative w-full flex flex-col bg-transparent"
        }
      >
        {/* Horizontal Track (Desktop) or Vertical Stack (Mobile) */}
        <div
          ref={trackRef}
          className={
            isDesktop
              ? "flex flex-row h-full will-change-transform select-none"
              : "flex flex-col w-full"
          }
          style={isDesktop ? { width: `${totalSlides * 100}vw` } : undefined}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              id={slide.id}
              className={
                isDesktop
                  ? "slideshow-slide w-screen h-screen shrink-0 relative overflow-hidden flex flex-col justify-center items-center"
                  : "w-full min-h-screen relative flex flex-col justify-center items-center"
              }
              style={isDesktop ? { width: '100vw', height: '100vh' } : undefined}
            >
              <div
                className={
                  slide.fullBleed
                    ? "w-full h-full flex flex-col justify-center items-center overflow-hidden"
                    : "w-full max-w-7xl h-full flex flex-col justify-center items-center overflow-y-auto overflow-x-hidden px-4 sm:px-8 lg:px-12 py-12 sm:py-16 scrollbar-none"
                }
              >
                {slide.content}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Slide HUD (Timeline Navigation Bar) */}
        {isDesktop && (
          <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center items-center pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => goToSlide(currentSlide - 1)}
                disabled={currentSlide === 0}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                aria-label="Previous section"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Progress Count */}
              <div className="flex items-center gap-2 px-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-bold text-accent">
                  {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>
                <span className="text-white/30">|</span>
                <span className="font-heading font-black tracking-wider uppercase text-white/90 truncate max-w-[180px] sm:max-w-[260px]">
                  {slides[currentSlide]?.title}
                </span>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => goToSlide(currentSlide + 1)}
                disabled={currentSlide === totalSlides - 1}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                aria-label="Next section"
              >
                <ChevronRight size={18} />
              </button>

              {/* Dot Indicators */}
              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentSlide
                        ? 'w-6 bg-accent shadow-[0_0_8px_var(--accent)]'
                        : 'w-2 bg-white/20 hover:bg-white/50'
                    }`}
                    aria-label={`Jump to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
