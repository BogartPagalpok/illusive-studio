import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CinematicStageProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Custom scroll length multiplier (default 1.2 for crisp pacing without scroll traps) */
  scrollMultiplier?: number;
}

export default function CinematicStage({
  id,
  className = '',
  children,
  scrollMultiplier = 1.2,
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
          onLeave: () => {
            gsap.set(stage, { autoAlpha: 0 });
          },
          onEnterBack: () => {
            gsap.set(stage, { autoAlpha: 1 });
          },
        },
      });

      // Phase 1: Snappy Entrance (0% -> 15% of scroll)
      // Text lands into place from bottom to top with directional motion blur
      if (textBottomToTop.length > 0) {
        tl.fromTo(
          textBottomToTop,
          {
            y: () => (window.innerWidth < 768 ? 60 : 80),
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
            x: () => (window.innerWidth < 768 ? -80 : -140),
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
            y: 40,
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

      // Phase 2: LOCKED VIEWING WINDOW (15% -> 85% of scroll)
      // Content holds static, dead-center, fully opaque, and pin-locked for reading

      // Phase 3: Exit (85% -> 100% of scroll)
      // Media flies out to the left with directional motion blur
      if (mediaElements.length > 0) {
        tl.to(
          mediaElements,
          {
            x: () => (window.innerWidth < 768 ? -80 : -140),
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
            y: () => (window.innerWidth < 768 ? -60 : -80),
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
            y: -40,
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

    return () => {
      ctx.revert();
    };
  }, [scrollMultiplier]);

  return (
    <div ref={containerRef} id={id} className="cinematic-stage-wrap w-full relative">
      <div
        ref={stageRef}
        className={`min-h-screen h-screen w-full flex flex-col items-center justify-center relative overflow-hidden select-none bg-[var(--bg-primary)] ${className}`}
        style={{ backgroundColor: 'var(--bg-primary, #030305)' }}
      >
        {children}
      </div>
    </div>
  );
}
