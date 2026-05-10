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

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = gsap.context(() => { 
      gsap.to(overlay, { 
        yPercent: -150, 
        opacity: 0, 
        ease: 'power2.in', 
        scrollTrigger: { 
          trigger: overlay.closest('section'), 
          start: 'top top', 
          end: '+=150vh', // Finishes the text animation fast, leaving the rest of the scroll for the face 
          scrub: 1, 
        }, 
      }); 
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" className="w-full bg-black">
      <ScrollSequence frameCount={288} fileExtension="webp" scrollLength={6}>
        {/* Floating 3D Identities */}
        <FloatingCube type="Ps" size={100} top="20%" left="10%" blur="2px" delay={0} duration={6} />
        <FloatingCube type="Ai" size={80} bottom="15%" right="12%" blur="1px" delay={1} duration={5} />

        {/* Hero overlay */}
        <div ref={overlayRef} className="absolute top-0 left-0 right-0 h-screen pointer-events-none z-10">
          {/* High-Contrast Tint Layer */}
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm md:text-base font-heading tracking-[0.3em] uppercase mb-6 text-white"
            >
              {content.subtitle}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="heading-xl max-w-4xl text-white font-bold tracking-tighter"
            >
              {content.heading_line1}
              <br />
              <span className="text-accent">{content.heading_line2}</span>
              <br />
              {content.heading_line3}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-6 text-white text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-10 flex gap-4 pointer-events-auto"
            >
              <a href="#works" onClick={(e) => scrollToId(e, 'works')} className="btn-primary">
                View Works
              </a>
              <a href="#contact" onClick={(e) => scrollToId(e, 'contact')} className="btn-outline">
                Get in Touch
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center gap-2 hover:text-accent transition-colors pointer-events-auto text-white"
              >
                <span className="text-xs font-heading tracking-widest uppercase">Scroll</span>
                <ArrowDown size={16} className="animate-bounce" />
              </button>
            </motion.div>
          </div>
        </div>
      </ScrollSequence>
    </section>
  );
}
