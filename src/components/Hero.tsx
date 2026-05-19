import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VideoScroll from './VideoScroll';
import { supabase } from '../lib/supabase';

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
    const timer = setTimeout(() => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      gsap.set(overlay, { opacity: 1 });

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
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} id="hero" className="w-full overflow-hidden relative bg-transparent">
      <VideoScroll videoUrl="https://ayfbrkudeqvvnhchmxas.supabase.co/storage/v1/object/public/media/ezgif-6112e225029ef273.webm">
        <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-10 pt-[80px]" style={{ opacity: 1 }}>
          <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none z-0" />

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full px-4 sm:px-6 pointer-events-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[9px] md:text-xs font-heading tracking-[0.3em] md:tracking-[0.4em] uppercase mb-6 md:mb-8 text-[var(--text-secondary)]/70 text-center w-full"
            >
              {content.subtitle}
            </motion.p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tighter leading-[1] uppercase text-center w-full">
              {content.heading_line1}<br />
              <span className="text-accent italic drop-shadow-[0_0_15px_var(--accent)]">{content.heading_line2}</span><br />
              {content.heading_line3}
            </h1>

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
              <a href="#works" onClick={(e) => scrollToId(e, 'works')} className="btn-primary py-3 px-8 text-[10px] uppercase font-bold tracking-[0.2em] text-center w-full sm:w-auto">View Works</a>
              <a href="#contact" onClick={(e) => scrollToId(e, 'contact')} className="btn-outline py-3 px-8 text-[10px] uppercase font-bold tracking-[0.2em] text-center w-full sm:w-auto">Get in Touch</a>
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
      </VideoScroll>
    </section>
  );
}
