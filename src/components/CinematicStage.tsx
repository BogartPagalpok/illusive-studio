import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CinematicStageProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Custom scroll length multiplier (default 2.2 for rock-solid pinning) */
  scrollMultiplier?: number;
}

export default function CinematicStage({
  id,
  className = '',
  children,
  scrollMultiplier = 2.2,
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
          end: () => `+=${Math.round(window.innerHeight * scrollMultiplier)}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1: Snappy Entrance (0% -> 15% of scroll)
      // Text lands into place from bottom to top with directional motion blur
      if (textBottomToTop.length > 0) {
        tl.fromTo(
          textBottomToTop,
          {
            y: () => (window.innerWidth < 768 ? 70 : 100),
            opacity: 0,
            filter: 'blur(8px)',
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.03,
            ease: 'power2.out',
            duration: 0.15,
          },
          0
        );
      }

      // Media sweeps from left to right into dead center stage with motion blur
      if (mediaElements.length > 0) {
        tl.fromTo(
          mediaElements,
          {
            x: () => (window.innerWidth < 768 ? -100 : -180),
            opacity: 0,
            filter: 'blur(8px)',
          },
          {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.04,
            ease: 'power2.out',
            duration: 0.15,
          },
          0.01
        );
      }

      // Generic stage elements
      if (allElements.length > 0) {
        tl.fromTo(
          allElements,
          {
            y: 50,
            opacity: 0,
            filter: 'blur(6px)',
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.03,
            ease: 'power2.out',
            duration: 0.15,
          },
          0
        );
      }

      // Phase 2: FIRMLY PINNED VIEWING WINDOW (15% -> 85% of scroll)
      // 70% of the entire scroll distance is firmly locked at 100% opacity,
      // 0px blur, dead-center in the viewport for effortless viewing/reading.

      // Phase 3: Exit (85% -> 100% of scroll)
      // Media flies out to the left with directional motion blur
      if (mediaElements.length > 0) {
        tl.to(
          mediaElements,
          {
            x: () => (window.innerWidth < 768 ? -120 : -220),
            opacity: 0,
            filter: 'blur(8px)',
            stagger: 0.03,
            ease: 'power2.in',
            duration: 0.15,
          },
          0.85
        );
      }

      // Text launches upward off screen with directional motion blur
      if (textElements.length > 0) {
        tl.to(
          textElements,
          {
            y: () => (window.innerWidth < 768 ? -70 : -100),
            opacity: 0,
            filter: 'blur(8px)',
            stagger: 0.03,
            ease: 'power2.in',
            duration: 0.15,
          },
          0.85
        );
      }

      if (allElements.length > 0) {
        tl.to(
          allElements,
          {
            y: -50,
            opacity: 0,
            filter: 'blur(6px)',
            stagger: 0.03,
            ease: 'power2.in',
            duration: 0.15,
          },
          0.85
        );
      }
    }, containerRef);

    // Refresh ScrollTrigger so pinning offsets are precisely calculated
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(refreshTimer);
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
