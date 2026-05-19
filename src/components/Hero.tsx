import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollSequence from './ScrollSequence';
import { supabase } from '../lib/supabase';
import KineticText from './KineticText';
import CursorGlow from './CursorGlow';
import MagneticButton from './MagneticButton';

gsap.registerPlugin(ScrollTrigger);

interface HeroContent {
  subtitle: string;
  heading_line1: string;
  heading_line2: string;
  heading_line3: string;
  description: string;
}

const defaultContent: HeroContent = {
  subtitle: 'Graphic Designer • Photographer • Virtual Assistant',
  heading_line1: 'Crafting Visual',
  heading_line2: 'Stories',
  heading_line3: 'Resonate',
  description: "I'm Ian Lester Eclevia — where timeless design meets modern execution. From brand identity to digital painting, I bring ideas to life with precision and passion.",
};

function scrollToId(e: React.MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  const [content, setContent] = useState<HeroContent>(defaultContent);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: contentData } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'hero');
        if (contentData && contentData.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of contentData) {
            const key = row.key.toLowerCase() as keyof HeroContent;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);
        }
      } catch {}
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = gsap.context(() => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=12%',
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="hero" className="w-full overflow-hidden relative bg-transparent">
      <ScrollSequence frameCount={288} fileExtension="webp" scrollLength={2}>
        <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-10 pt-[80px]">
          <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none z-0" />

          <CursorGlow containerRef={overlayRef as React.RefObject<HTMLElement>} />

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-4 sm:px-6 pointer-events-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[9px] md:text-xs font-heading tracking-[0.3em] md:tracking-[0.4em] uppercase mb-6 md:mb-8 text-[var(--text-secondary)]/70 text-center w-full"
            >
              {content.subtitle}
            </motion.p>

            <KineticText
              line1={content.heading_line1}
              line2={content.heading_line2}
              line3={content.heading_line3}
              triggerRef={sectionRef}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-6 md:mt-8 text-xs md:text-base max-w-lg mx-auto text-center leading-relaxed text-[var(--text-secondary)]/80 w-full"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
            >
              <MagneticButton
                href="#works"
                onClick={(e) => scrollToId(e, 'works')}
                className="btn-primary py-3 px-8 text-[10px] uppercase font-bold tracking-[0.2em] text-center w-full sm:w-auto"
              >
                View Works
              </MagneticButton>
              <MagneticButton
                href="#contact"
                onClick={(e) => scrollToId(e, 'contact')}
                className="btn-outline py-3 px-8 text-[10px] uppercase font-bold tracking-[0.2em] text-center w-full sm:w-auto"
              >
                Get in Touch
              </MagneticButton>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto z-20"
          >
            <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)]/40 hover:text-accent transition-colors duration-300 w-full">
              <span className="text-[10px] font-heading font-black tracking-[0.3em] uppercase text-center block">Scroll</span>
              <ArrowDown size={16} className="animate-bounce mx-auto" />
            </button>
          </motion.div>
        </div>
      </ScrollSequence>
    </section>
  );
}
