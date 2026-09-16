import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CinematicStageProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Custom scroll length multiplier (default 1.25) */
  scrollMultiplier?: number;
}

export default function CinematicStage({
  id,
  className = '',
  children,
  scrollMultiplier = 1.25,
}: CinematicStageProps) {
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
          anticipatePin: 1,
          scrub: 0.6,
        },
      });

      // Phase 1: Entrance (0% -> 35% of scroll)
      // Text lands from bottom to top with directional motion blur
      if (textBottomToTop.length > 0) {
        tl.fromTo(
          textBottomToTop,
          {
            y: () => (window.innerWidth < 768 ? 90 : 140),
            opacity: 0,
            filter: 'blur(10px)',
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.08,
            ease: 'power2.out',
            duration: 0.35,
          },
          0
        );
      }

      // Media sweeps from left to right one by one with motion blur into dead center
      if (mediaElements.length > 0) {
        tl.fromTo(
          mediaElements,
          {
            x: () => (window.innerWidth < 768 ? -120 : -220),
            opacity: 0,
            filter: 'blur(10px)',
          },
          {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.1,
            ease: 'power2.out',
            duration: 0.4,
          },
          0.04
        );
      }

      // Generic stage elements if used
      if (allElements.length > 0) {
        tl.fromTo(
          allElements,
          {
            y: 70,
            opacity: 0,
            filter: 'blur(8px)',
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.06,
            ease: 'power2.out',
            duration: 0.35,
          },
          0
        );
      }

      // Phase 2: Rest & View (35% -> 65% of scroll)
      // Elements hold position dead-center for reading and interaction

      // Phase 3: Exit (65% -> 100% of scroll)
      // Media flies out to the left with motion blur
      if (mediaElements.length > 0) {
        tl.to(
          mediaElements,
          {
            x: () => (window.innerWidth < 768 ? -140 : -260),
            opacity: 0,
            filter: 'blur(10px)',
            stagger: 0.08,
            ease: 'power2.in',
            duration: 0.35,
          },
          0.65
        );
      }

      // Text launches upward off screen with motion blur
      if (textElements.length > 0) {
        tl.to(
          textElements,
          {
            y: () => (window.innerWidth < 768 ? -90 : -140),
            opacity: 0,
            filter: 'blur(10px)',
            stagger: 0.06,
            ease: 'power2.in',
            duration: 0.35,
          },
          0.65
        );
      }

      if (allElements.length > 0) {
        tl.to(
          allElements,
          {
            y: -70,
            opacity: 0,
            filter: 'blur(8px)',
            stagger: 0.06,
            ease: 'power2.in',
            duration: 0.35,
          },
          0.65
        );
      }
    }, stage);

    return () => {
      ctx.revert();
    };
  }, [scrollMultiplier]);

  return (
    <div
      ref={stageRef}
      id={id}
      className={`min-h-screen h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-transparent select-none ${className}`}
      style={{ contain: 'paint' }}
    >
      {children}
    </div>
  );
}
