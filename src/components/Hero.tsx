import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDownDuotone } from './icons/StreamlineIcons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollSequence from './ScrollSequence';
import { supabase } from '../lib/supabase';
import FloatingCube from './FloatingCube';

gsap.registerPlugin(ScrollTrigger);

interface HeroContent {
  subtitle: string;
  heading_line1: string;
  heading_line2: string;
  heading_line3: string;
  description: string;
}

const defaultContent: HeroContent = {
  subtitle: 'Video Editor • Graphics Artist',
  heading_line1: 'Crafting',
  heading_line2: 'Visual Stories',
  heading_line3: 'That Resonate',
  description: "I'm Ian Lester Eclevia — a video editor and graphics artist creating polished visual stories, expressive motion, and memorable brand content.",
};

// Removed the standard HTML smooth scroll fallback from here
// since you are utilizing GSAP and Framer Motion which can conflict with standard CSS scrolling behaviors.

function scrollToId(e: React.MouseEvent, id: string) {
  e.preventDefault();
  
  const element = document.getElementById(id);
  if (element) {
    if (window.__lenis) {
      window.__lenis.scrollTo(element, { offset: -80, duration: 1.2 });
    } else {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}

export default function Hero() {
  const [content, setContent] = useState<HeroContent>(defaultContent);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], ['0%', '-20%']);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: contentData, error: contentError } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'hero')
          .eq('visible', true);

        if (!contentError && contentData && contentData.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of contentData) {
            const key = row.key.toLowerCase() as keyof HeroContent;
            if (key in mapped) mapped[key] = row.value;
          }
          // Normalize legacy rows so "Visual Stories" is the highlighted line
          if (
            mapped.heading_line1.trim().toLowerCase() === 'crafting visual' ||
            mapped.heading_line2.trim().toLowerCase() === 'stories that' ||
            mapped.heading_line2.trim().toLowerCase() === 'stories'
          ) {
            mapped.heading_line1 = 'Crafting';
            mapped.heading_line2 = 'Visual Stories';
            mapped.heading_line3 = 'That Resonate';
          }
          setContent(mapped);
        }
      } catch {
        // Use defaults
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = gsap.context(() => {
      gsap.to(overlay, {
        yPercent: -100,
        opacity: 0,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: window.innerWidth < 768 ? '+=100%' : '+=150%',
          scrub: 0.5,
        },
      });
    });

    const handleThemeChange = () => {
      setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    window.addEventListener('storage', handleThemeChange);

    return () => {
      ctx.revert();
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="w-full overflow-hidden relative bg-transparent"
    >
      <ScrollSequence frameCount={288} fileExtension="webp" scrollLength={window.innerWidth < 768 ? 2 : 2}>
        <div className="hidden lg:block pointer-events-none">
          <FloatingCube type="Ps" size={90} top="16%" left="3%" blur="1px" delay={0} duration={6} />
          <FloatingCube type="Ai" size={75} bottom="20%" right="3%" blur="1px" delay={1} duration={5} />
        </div>

        <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-10 pt-[72px] sm:pt-[84px]">
          {/* Subtle radial vignette that keeps the center clear for the face while boosting readability on edges */}
          <div 
            className="absolute inset-0 pointer-events-none z-0" 
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)',
            }}
          />

          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="relative z-10 flex flex-col justify-between w-full h-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pointer-events-auto"
          >
            {/* Main Left & Right Split Container */}
            <div className="flex-1 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-12 w-full my-auto">
              
              {/* LEFT COLUMN: Subtitle + Giant Headline */}
              <div className="w-full lg:w-3/5 text-left max-w-2xl">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-[10px] sm:text-xs md:text-sm font-heading tracking-[0.25em] md:tracking-[0.35em] uppercase mb-3 sm:mb-4 md:mb-6 font-bold text-accent drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] flex items-center gap-2"
                  style={{ textShadow: '0 0 20px rgba(var(--accent-rgb), 0.6), 0 2px 10px rgba(0, 0, 0, 0.9)' }}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                  {content.subtitle}
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.92] uppercase text-left w-full"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  <span className="text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)] block">
                    {content.heading_line1}
                  </span>
                  <span
                    className="italic text-accent block my-1 sm:my-2"
                    style={{
                      textShadow: '0 0 25px var(--accent), 0 0 50px rgba(var(--accent-rgb), 0.5)',
                    }}
                  >
                    {content.heading_line2}
                  </span>
                  <span className="text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)] block">
                    {content.heading_line3}
                  </span>
                </motion.h1>
              </div>

              {/* RIGHT COLUMN: Catchphrase + Description + CTAs */}
              <div className="w-full lg:w-2/5 flex flex-col items-start lg:items-end text-left lg:text-right max-w-md lg:ml-auto">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-sm sm:text-base lg:text-xl font-bold uppercase tracking-tight text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] mb-2 sm:mb-3"
                >
                  We Turn Attention Into Action.
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-xs sm:text-sm md:text-base leading-relaxed font-medium text-white/85 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] mb-5 sm:mb-7"
                >
                  {content.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
                >
                  <a
                    href="#works"
                    onClick={(e) => scrollToId(e, 'works')}
                    className="btn-primary py-3 px-6 sm:px-8 text-[10px] uppercase font-bold tracking-[0.2em] text-center shadow-xl flex-1 sm:flex-initial"
                  >
                    View Works
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => scrollToId(e, 'contact')}
                    className="btn-outline !border-white/80 !text-white hover:!bg-white hover:!text-black py-3 px-6 sm:px-8 text-[10px] uppercase font-bold tracking-[0.2em] text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex-1 sm:flex-initial"
                  >
                    Get in Touch
                  </a>
                </motion.div>
              </div>

            </div>

            {/* BOTTOM BAR: #01, #02, #03, #04 specialty pills + Scroll button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="w-full flex flex-col md:flex-row items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-white/10 mt-auto"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full md:w-auto">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono font-bold text-accent"># 01</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Video Editing</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono font-bold text-accent"># 02</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Motion Graphics</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono font-bold text-accent"># 03</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Graphic Design</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono font-bold text-accent"># 04</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Visual Direction</span>
                </div>
              </div>

              {/* Scroll down trigger */}
              <button
                onClick={(e) => scrollToId(e as any, 'services')} 
                className="hidden md:flex items-center gap-2 !text-white/70 hover:!text-white transition-colors duration-300 ml-auto shrink-0 group cursor-pointer"
              >
                <span className="text-[10px] font-heading font-black tracking-[0.3em] uppercase">Scroll</span>
                <ArrowDownDuotone size={14} className="group-hover:translate-y-1 transition-transform text-accent" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </ScrollSequence>
    </section>
  );
}
