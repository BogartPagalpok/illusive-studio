import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  subtitle: 'Graphic Designer \u2022 Photographer \u2022 Virtual Assistant',
  heading_line1: 'Crafting Visual',
  heading_line2: 'Stories',
  heading_line3: 'Resonate',
  description: "I'm Ian Lester Eclevia \u2014 where timeless design meets modern execution. From brand identity to digital painting, I bring ideas to life with precision and passion.",
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
      // We apply the animation with immediateRender: false so it doesn't 
      // override Framer Motion's initial page-load animation.
      gsap.to(overlay, { 
        yPercent: -100, 
        opacity: 0, 
        ease: 'none',
        immediateRender: false, // <-- CRITICAL FIX: Lets Framer Motion finish first
        scrollTrigger: { 
          trigger: sectionRef.current, 
          start: 'top top', 
          end: window.innerWidth < 768 ? '+=100%' : '+=150%', 
          scrub: 0.5, 
        }, 
      }); 
    });

    // Listen for theme changes so GSAP recalculates heights
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
    <section ref={sectionRef} id="hero" className="w-full bg-black overflow-hidden">
      {/* ScrollSequence needs to be responsive. Ensure your ScrollSequence component 
          handles 'object-fit: cover' internally for the canvas/images */}
      <ScrollSequence frameCount={288} fileExtension="webp" scrollLength={window.innerWidth < 768 ? 4 : 6}>
        
        {/* Hide Floating Cubes on very small screens to reduce clutter and zoom-in feeling */}
        <div className="hidden md:block">
          <FloatingCube type="Ps" size={100} top="20%" left="10%" blur="2px" delay={0} duration={6} />
          <FloatingCube type="Ai" size={80} bottom="15%" right="12%" blur="1px" delay={1} duration={5} />
        </div>

        {/* Hero overlay - using dvh (dynamic viewport height) for mobile browser support */}
        <div ref={overlayRef} className="absolute top-0 left-0 right-0 h-[100dvh] pointer-events-none z-10 flex items-center justify-center">
          
          {/* High-Contrast Tint Layer */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
          
          <div className="relative w-full max-w-5xl flex flex-col items-center text-center px-6 pt-10">
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
              className="text-4xl md:text-7xl lg:text-8xl text-white font-bold tracking-tighter leading-[0.9] uppercase"
            >
              {content.heading_line1}
              <br />
              <span className="text-accent italic">{content.heading_line2}</span>
              <br />
              {content.heading_line3}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-6 text-sm md:text-lg max-w-xl mx-auto leading-relaxed text-white/70 px-4"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 pointer-events-auto"
            >
              <a href="#works" onClick={(e) => scrollToId(e, 'works')} className="btn-primary py-3 px-8 text-xs tracking-widest">
                View Works
              </a>
              <a href="#contact" onClick={(e) => scrollToId(e, 'contact')} className="btn-outline py-3 px-8 text-xs tracking-widest">
                Get in Touch
              </a>
            </motion.div>

            {/* Scroll Indicator - Hidden on very short mobile screens */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="hidden sm:block absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center gap-2 hover:text-accent transition-colors pointer-events-auto text-white/50"
              >
                <span className="text-[10px] font-heading tracking-widest uppercase">Scroll</span>
                <ArrowDown size={14} className="animate-bounce" />
              </button>
            </motion.div>
          </div>
        </div>
      </ScrollSequence>
    </section>
  );
}
