import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface KineticTextProps {
  line1: string;
  line2: string;
  line3: string;
  triggerRef: React.RefObject<HTMLElement | null>;
}

interface WordProps {
  text: string;
  className?: string;
  index: number;
  totalInLine: number;
  lineIndex: number;
  trigger: HTMLElement;
}

function Word({ text, className, index, totalInLine, lineIndex, trigger }: WordProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !trigger) return;

    const ctx = gsap.context(() => {
      if (lineIndex === 0) {
        // Line 1: scatter outward with rotation and scale down
        const direction = index % 2 === 0 ? 1 : -1;
        const offset = (index - totalInLine / 2) * 80;
        gsap.fromTo(el, { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 }, {
          opacity: 0,
          x: offset * 2.5,
          y: direction * (40 + index * 15),
          rotation: direction * (15 + index * 8),
          scale: 0.3,
          ease: 'power2.in',
          scrollTrigger: {
            trigger,
            start: 'top top',
            end: '+=12%',
            scrub: true,
          },
        });
      } else if (lineIndex === 1) {
        // Line 2 (accent): scale up explosively then shrink away
        gsap.fromTo(el, { opacity: 1, scale: 1, y: 0 }, {
          opacity: 0,
          scale: 2.5,
          y: -60,
          ease: 'power3.in',
          scrollTrigger: {
            trigger,
            start: 'top top',
            end: '+=10%',
            scrub: true,
          },
        });
      } else {
        // Line 3: slide off-screen in alternating directions
        const direction = index % 2 === 0 ? 1 : -1;
        gsap.fromTo(el, { opacity: 1, x: 0, y: 0 }, {
          opacity: 0,
          x: direction * (200 + index * 60),
          y: direction * 30,
          ease: 'power2.in',
          scrollTrigger: {
            trigger,
            start: 'top top',
            end: '+=14%',
            scrub: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [index, totalInLine, lineIndex, trigger]);

  return (
    <span ref={ref} className={`inline-block ${className || ''}`}>
      {text}
    </span>
  );
}

export default function KineticText({ line1, line2, line3, triggerRef }: KineticTextProps) {
  const words1 = line1.split(' ');
  const words2 = line2.split(' ');
  const words3 = line3.split(' ');
  const trigger = triggerRef.current;

  if (!trigger) return null;

  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tighter leading-[1] uppercase text-center w-full">
      {words1.map((word, i) => (
        <Word
          key={`l1-${i}`}
          text={word}
          index={i}
          totalInLine={words1.length}
          lineIndex={0}
          trigger={trigger}
          className="mr-[0.3em]"
        />
      ))}
      <br />
      {words2.map((word, i) => (
        <Word
          key={`l2-${i}`}
          text={word}
          index={i}
          totalInLine={words2.length}
          lineIndex={1}
          trigger={trigger}
          className="text-accent italic drop-shadow-[0_0_15px_var(--accent)] mr-[0.3em]"
        />
      ))}
      <br />
      {words3.map((word, i) => (
        <Word
          key={`l3-${i}`}
          text={word}
          index={i}
          totalInLine={words3.length}
          lineIndex={2}
          trigger={trigger}
          className="mr-[0.3em]"
        />
      ))}
    </h1>
  );
}
