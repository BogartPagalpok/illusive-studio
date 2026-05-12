import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
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

  // --- SCROLL TRACKING ---
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // 1. Main Hero Text: Fades out quickly (0% to 15% of scroll) to reveal the background
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], ['0%', '-20%']);

  // 2. Flavor Text (Scroll Bridge): Fades IN at 25%, scales up, and fades OUT at 85%
  const flavorOpacity = useTransform(scrollYProgress, [0.25, 0.35, 0.85, 0.95], [0, 1, 1, 0]);
  const flavorScale = useTransform(scrollYProgress, [0.25, 0.95], [0.9, 1.1]);
  const flavorY = useTransform(scrollYProgress, [0.25, 0.95], ['50px', '-100px']);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: contentData, error: contentError } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'hero');

        if (!contentError && contentData && contentData.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of contentData) {
            const key = row.key.toLowerCase() as keyof HeroContent;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);
        }
      } catch {
        // Use defaults
      }
    };
    fetchContent();
  }, []);

  // GSAP SCROLL FIX (Long scroll length maintained)
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
    <section ref={sectionRef} id="hero" className="w-full bg-black overflow-hidden relative">
      <ScrollSequence frameCount={288} fileExtension="webp" scrollLength={window.innerWidth < 768 ? 4 : 6}>
        
        <div className="hidden md:block">
          <FloatingCube type="Ps" size={100} top="20%" left="10%" blur="2px" delay={0} duration={6} />
          <FloatingCube type="Ai" size={80} bottom="15%" right="12%" blur="1px" delay={1} duration={5} />
        </div>

        <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-10 pt-[80px]">
          
          <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none z-0" />

          {/* LAYER 1: MAIN HERO TEXT (Fades out early) */}
          <motion.div 
            style={{ opacity: heroOpacity, y: heroY }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-6 pointer-events-auto"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[10px] md:text-xs font-heading tracking-[0.4em] uppercase mb-6 md:mb-8 text-white/70"
            >
              {content.subtitle}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tighter leading-[1] uppercase text-center"
            >
              {content.heading_line1}
              <br />
              <span className="text-accent italic drop-shadow-[0_0_15px_var(--accent)]">{content.heading_line2}</span>
              <br />
              {content.heading_line3}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-6 md:mt-8 text-xs md:text-base max-w-lg mx-auto text-center leading-relaxed text-white/70 px-4"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4"
            >
              <a href="#works" onClick={(e) => scrollToId(e, 'works')} className="btn-primary py-3 px-8 text-[10px] uppercase font-bold tracking-[0.2em]">
                View Works
              </a>
              <a href="#contact" onClick={(e) => scrollToId(e, 'contact')} className="btn-outline py-3 px-8 text-[10px] uppercase font-bold tracking-[0.2em] bg-black/40 backdrop-blur-md">
                Get in Touch
              </a>
            </motion.div>
          </motion.div>

          {/* LAYER 2: FLAVOR TEXT / SCROLL BRIDGE (Appears during the blank space) */}
          <motion.div
            style={{ opacity: flavorOpacity, scale: flavorScale, y: flavorY }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Top Tech Line */}
              <div className="w-px h-16 md:h-24 bg-gradient-to-b from-transparent to-accent" />
              
              {/* Core Flavor Statement */}
              <h2 className="text-2xl md:text-4xl font-heading font-black tracking-widest uppercase text-white text-center leading-tight">
                Engineering <br />
                <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', color: 'transparent' }}>
                  Visual Reality
                </span>
              </h2>
              
              {/* Sub-tags */}
              <div className="flex gap-4 md:gap-8 text-[8px] md:text-[10px] font-heading font-black tracking-[0.4em] uppercase text-accent">
                <span>Identity</span>
                <span className="opacity-40">//</span>
                <span>Motion</span>
                <span className="opacity-40">//</span>
                <span>Pixels</span>
              </div>
              
              {/* Bottom Tech Line */}
              <div className="w-px h-16 md:h-24 bg-gradient-to-b from-accent to-transparent" />
            </div>
          </motion.div>

          {/* FIXED SCROLL INDICATOR */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto z-20"
          >
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-2 text-white/40 hover:text-accent transition-colors duration-300"
            >
              <span className="text-[10px] font-heading font-black tracking-[0.3em] uppercase">Scroll</span>
              <ArrowDown size={16} className="animate-bounce" />
            </button>
          </motion.div>

        </div>
      </ScrollSequence>
    </section>
  );
}
