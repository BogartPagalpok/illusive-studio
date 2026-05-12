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

  // Scroll Tracking for the Background Marquee
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Map scroll progress to horizontal movement (opposite directions)
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-50%', '0%']);

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

  // GSAP SCROLL FIX
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

        <div ref={overlayRef} className="absolute top-0 left-0 right-0 h-[100dvh] pointer-events-none z-10 flex items-center justify-center overflow-hidden">
          
          {/* HIGH-END MARQUEE EFFECT: Sliding Background Text */}
          <div className="absolute inset-0 z-0 flex flex-col justify-center gap-12 opacity-20 pointer-events-none mix-blend-overlay">
            <motion.div 
              style={{ x: x1 }} 
              className="whitespace-nowrap text-[12vw] font-heading font-black uppercase text-white tracking-tighter leading-none"
            >
              BRAND IDENTITY • DIGITAL PAINTING • UI/UX DESIGN • BRAND IDENTITY • DIGITAL PAINTING
            </motion.div>
            <motion.div 
              style={{ x: x2 }} 
              className="whitespace-nowrap text-[12vw] font-heading font-black uppercase tracking-tighter leading-none"
              style={{ 
                x: x2, 
                WebkitTextStroke: '2px rgba(255,255,255,0.8)', 
                color: 'transparent' 
              }}
            >
              PHOTOGRAPHY • CREATIVE DIRECTION • VISUAL ARTS • PHOTOGRAPHY • CREATIVE DIRECTION
            </motion.div>
          </div>

          <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-0" />
          
          <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center px-6 pt-10">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[10px] md:text-sm font-heading tracking-[0.3em] uppercase mb-4 text-white/80"
            >
              {content.subtitle}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl text-white font-bold tracking-tighter leading-[0.9] uppercase"
            >
              {content.heading_line1}
              <br />
              <span className="text-accent italic drop-shadow-[0_0_20px_var(--accent)]">{content.heading_line2}</span>
              <br />
              {content.heading_line3}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 text-sm md:text-lg max-w-xl mx-auto leading-relaxed text-white/70 px-4"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 pointer-events-auto"
            >
              <a href="#works" onClick={(e) => scrollToId(e, 'works')} className="btn-primary py-4 px-10 text-[10px] uppercase font-bold tracking-[0.2em]">
                View Works
              </a>
              <a href="#contact" onClick={(e) => scrollToId(e, 'contact')} className="btn-outline py-4 px-10 text-[10px] uppercase font-bold tracking-[0.2em] bg-black/40 backdrop-blur-md">
                Get in Touch
              </a>
            </motion.div>
          </div>

          {/* FIXED: Scroll Indicator moved strictly to the bottom of the viewport */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto z-20"
          >
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-3 hover:text-accent transition-colors text-white/40 hover:scale-110 duration-300"
            >
              <span className="text-[9px] font-heading font-black tracking-[0.4em] uppercase">Scroll</span>
              <div className="p-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
                <ArrowDown size={14} className="animate-bounce text-accent" />
              </div>
            </button>
          </motion.div>
        </div>
      </ScrollSequence>
    </section>
  );
}
