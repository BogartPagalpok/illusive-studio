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
      } catch {
        // Use defaults
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bg,
        { yPercent: 0 },
        {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="section-padding bg-transparent relative overflow-hidden">
      {/* Floating 3D Identities */}
      <FloatingCube type="Canva" size={100} top="5%" right="10%" blur="4px" delay={0.3} duration={7} />
      <FloatingCube type="Ps" size={70} bottom="15%" left="10%" blur="1px" delay={1.2} duration={5} />

      {/* Parallax depth layer */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      <div ref={ref} className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
            {content.subtitle}
          </p>
          <h2 className="text-[var(--text-primary)] font-bold tracking-tighter heading-lg">
            {content.heading.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* About Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="card-dark group">
              <h3 className="text-[var(--text-primary)] font-bold tracking-tighter text-2xl mb-8 leading-tight">
                {content.subheading.includes('.') ? (
                  <>
                    {content.subheading.split('.')[0]}. <span className="text-accent">{content.subheading.split('.')[1].trim()}</span>
                  </>
                ) : (
                  content.subheading
                )}
              </h3>
              <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed text-lg font-light">
                <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-accent first-letter:mr-3 first-letter:float-left">{content.description_line1}</p>
                <p>{content.description_line2}</p>
                <p className="italic opacity-60" style={{ color: 'var(--text-primary)' }}>{content.description_line3}</p>
              </div>
            </div>
          </motion.div>

          {/* Upgraded Modern Skills */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-10"
          >
            <h3 className="text-[var(--text-primary)] font-bold tracking-tighter text-2xl uppercase">
              Skills <span className="text-accent">&</span> Proficiency
            </h3>

            <div className="space-y-8">
              {skills.map((skill, i) => (
                <div key={skill.name} className="relative">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-heading font-black tracking-[0.2em] uppercase text-[var(--text-primary)] opacity-50">
                      {skill.name}
                    </span>
                    <span className="text-sm font-heading font-black text-accent drop-shadow-[0_0_8px_var(--accent)]">
                      {skill.level}%
                    </span>
                  </div>
                  
                  {/* Neon Glass Bar Container */}
                  <div className="h-[6px] w-full bg-[var(--text-primary)]/5 rounded-full overflow-hidden border border-[var(--text-primary)]/10 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isVisible ? { width: `${skill.level}%` } : {}}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: 'circOut' }}
                      style={{ backgroundColor: 'var(--accent)' }}
                      className="h-full relative rounded-full"
                    >
                      {/* Glow Head */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full blur-[6px] opacity-80" style={{ backgroundColor: 'var(--accent)' }} />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />
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
