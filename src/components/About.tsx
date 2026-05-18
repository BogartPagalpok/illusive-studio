import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { supabase } from '../lib/supabase';
import FloatingCube from './FloatingCube';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  { name: 'Photoshop', level: 95 },
  { name: 'Digital Painting', level: 90 },
  { name: 'Adobe Lightroom', level: 88 },
  { name: 'Traditional Arts', level: 85 },
  { name: 'Photography', level: 92 },
  { name: 'Canva', level: 90 },
  { name: 'Videography', level: 80 },
  { name: 'Typography', level: 87 },
];

interface AboutContent {
  subtitle: string;
  heading: string;
  subheading: string;
  description_line1: string;
  description_line2: string;
  description_line3: string;
  skills_heading: string;
}

const defaultContent: AboutContent = {
  subtitle: 'Who I Am',
  heading: 'About & Skills',
  subheading: 'Creative mind. Reliable hands.',
  description_line1: "I'm Ian Lester Eclevia — a graphic designer, photographer, and virtual assistant who believes that great design is where timeless elegance meets modern trends.",
  description_line2: "With deep proficiency in Photoshop, digital painting, and photography, I craft visual stories that don't just look beautiful — they communicate, connect, and convert.",
  description_line3: "Beyond design, I bring the same dedication to virtual assistance — organized, proactive, and committed to making your operations run seamlessly.",
  skills_heading: 'Skills & Proficiency',
};

export default function About() {
  const { ref, isVisible } = useScrollReveal();
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'about');
        if (!error && data && data.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of data) {
            const key = row.key.toLowerCase() as keyof AboutContent;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);
        }
      } catch {}
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(bg, { yPercent: 0 }, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative section-padding overflow-visible z-40 bg-transparent">
      <div id="about" className="absolute -top-20 left-0 w-full h-1 pointer-events-none" />

      <FloatingCube type="Canva" size={80} top="5%" right="10%" blur="4px" delay={0.3} duration={7} />
      <FloatingCube type="Ps" size={55} bottom="15%" left="10%" blur="1px" delay={1.2} duration={5} />

      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      <div ref={ref} className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <span className="section-subtitle">{content.subtitle}</span>
          <h2 className="section-title">
            {content.heading.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="section-divider" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-dark">
              <h3 className="font-bold tracking-tighter mb-4 leading-tight text-[var(--text-primary)]" style={{ fontSize: 'clamp(16px, 2vw, 24px)' }}>
                {content.subheading.includes('.') ? (
                  <>
                    {content.subheading.split('.')[0]}. <span className="text-accent">{content.subheading.split('.')[1].trim()}</span>
                  </>
                ) : (
                  content.subheading
                )}
              </h3>
              <div className="space-y-3 font-light text-[var(--text-secondary)]" style={{ fontSize: 'clamp(12px, 1.1vw, 16px)' }}>
                <p className="first-letter:text-3xl first-letter:font-bold first-letter:text-accent first-letter:mr-2 first-letter:float-left">
                  {content.description_line1}
                </p>
                <p>{content.description_line2}</p>
                <p className="italic opacity-90">{content.description_line3}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-5"
          >
            <h3 className="font-black uppercase tracking-tighter text-[var(--text-primary)]" style={{ fontSize: 'clamp(16px, 2vw, 24px)' }}>
              Skills <span className="text-accent">&</span> Proficiency
            </h3>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {skills.map((skill, i) => (
                <div key={skill.name} className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-bold uppercase text-[var(--text-primary)]/50 group-hover:text-accent transition-colors" style={{ fontSize: 'clamp(8px, 0.9vw, 12px)', letterSpacing: '0.2em' }}>
                      {skill.name}
                    </span>
                    <span className="font-black text-[var(--text-primary)]/90" style={{ fontSize: 'clamp(9px, 0.9vw, 13px)' }}>
                      {skill.level}%
                    </span>
                  </div>
                  <div className="h-[3px] w-full bg-[var(--text-primary)]/5 rounded-full overflow-hidden border border-[var(--glass-border)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isVisible ? { width: `${skill.level}%` } : {}}
                      transition={{ duration: 1, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      style={{ backgroundColor: 'var(--accent)' }}
                      className="h-full relative rounded-full"
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
