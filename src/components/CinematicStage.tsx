import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CinematicStageProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Custom scroll length multiplier (default 1.5) */
  scrollMultiplier?: number;
}

export default function CinematicStage({
  id,
  className = '',
  children,
  scrollMultiplier = 1.5,
}: CinematicStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      // Find elements with semantic animation classes
      const textElements = Array.from(stage.querySelectorAll('.stage-text'));
      const mediaElements = Array.from(stage.querySelectorAll('.stage-media'));
      const allElements = Array.from(stage.querySelectorAll('.stage-element'));

      // Bottom-to-top succession: reverse DOM order so lower elements land first
      const textBottomToTop = [...textElements].reverse();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: `+=${Math.round(window.innerHeight * scrollMultiplier)}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1: Entrance (0% -> 20% of scroll)
      // Text lands from bottom to top with directional motion blur
      if (textBottomToTop.length > 0) {
        tl.fromTo(
          textBottomToTop,
          {
            y: () => (window.innerWidth < 768 ? 80 : 120),
            opacity: 0,
            filter: 'blur(8px)',
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.04,
            ease: 'power2.out',
            duration: 0.2,
          },
          0
        );
      }

      // Media sweeps from left to right one by one with motion blur into dead center
      if (mediaElements.length > 0) {
        tl.fromTo(
          mediaElements,
          {
            x: () => (window.innerWidth < 768 ? -120 : -200),
            opacity: 0,
            filter: 'blur(8px)',
          },
          {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.06,
            ease: 'power2.out',
            duration: 0.22,
          },
          0.02
        );
      }

      // Generic stage elements if used
      if (allElements.length > 0) {
        tl.fromTo(
          allElements,
          {
            y: 60,
            opacity: 0,
            filter: 'blur(6px)',
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.04,
            ease: 'power2.out',
            duration: 0.2,
          },
          0
        );
      }

      // Phase 2: Rest & View (20% -> 80% of scroll)
      // Elements hold locked position dead-center with 0px blur and full opacity for easy viewing

      // Phase 3: Exit (80% -> 100% of scroll)
      // Media flies out to the left with motion blur
      if (mediaElements.length > 0) {
        tl.to(
          mediaElements,
          {
            x: () => (window.innerWidth < 768 ? -140 : -240),
            opacity: 0,
            filter: 'blur(8px)',
            stagger: 0.04,
            ease: 'power2.in',
            duration: 0.2,
          },
          0.8
        );
      }

      // Text launches upward off screen with motion blur
      if (textElements.length > 0) {
        tl.to(
          textElements,
          {
            y: () => (window.innerWidth < 768 ? -80 : -120),
            opacity: 0,
            filter: 'blur(8px)',
            stagger: 0.04,
            ease: 'power2.in',
            duration: 0.2,
          },
          0.8
        );
      }

      if (allElements.length > 0) {
        tl.to(
          allElements,
          {
            y: -60,
            opacity: 0,
            filter: 'blur(6px)',
            stagger: 0.04,
            ease: 'power2.in',
            duration: 0.2,
          },
          0.8
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [scrollMultiplier]);

  return (
    <div ref={containerRef} id={id} className="cinematic-stage-wrap w-full relative">
      <div
        ref={stageRef}
        className={`min-h-screen h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-transparent select-none ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
