import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { supabase } from '../lib/supabase';

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
  subtitle: '01 / Core Philosophy',
  heading: 'Bridging Creative Vision & Hardware Execution',
  subheading: 'Creative mind. Reliable hands.',
  description_line1: "I eliminate the friction between high-end digital design and production deployment. By operating fluidly across user experience architectures, clean layout engineering, and next-gen multimodal AI pipelines, I build high-retention digital ecosystems tailored for maximum visual impact.",
  description_line2: "",
  description_line3: "Status: Available for Freelance & Roles",
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

  const stats = [
    { value: '01', label: 'UI/UX & Visual Architecture', desc: 'Specializing in high-contrast dark aesthetics, crisp layout geometry, and intentional grid structures that scale seamlessly across devices.' },
    { value: '02', label: 'Frontend Engineering', desc: 'Writing clean, component-driven React and Tailwind code. Prioritizing hardware-accelerated transitions and optimized rendering.' },
    { value: '03', label: 'Next-Gen Asset Pipelines', desc: 'Leveraging advanced multi-modal AI prompt engineering and asset generation to deliver cinematic, high-fidelity visual content rapidly.' },
  ];

  return (
    <section ref={sectionRef} className="min-h-screen w-full relative flex items-center justify-center py-24 px-6 md:px-16 overflow-hidden bg-transparent z-40">
      <div id="about" className="absolute -top-20 left-0 w-full h-1 pointer-events-none" />

      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      <div ref={ref} className="section-container w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative z-10">
        
        {/* LEFT COLUMN: INTRO MANIFESTO */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-accent block">
              {content.subtitle}
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight uppercase leading-none text-[var(--text-primary)]">
              {content.heading.split(' ').map((word, i, arr) => (
                <span key={i}>
                  {word === '&' ? <span className="text-accent">&</span> : word}
                  {i < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
              <span className="text-accent">.</span>
            </h2>
          </div>
          
          <p className="text-base opacity-70 font-sans leading-relaxed max-w-md">
            {content.description_line1}
          </p>

          {content.description_line2 && (
            <p className="text-base opacity-70 font-sans leading-relaxed max-w-md">
              {content.description_line2}
            </p>
          )}

          <div className="pt-4">
            <span className="inline-block text-[10px] font-mono tracking-widest uppercase opacity-40 border border-white/10 px-3 py-1 rounded-full">
              {content.description_line3}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED ASYMMETRIC PILLARS & SKILLS */}
        <div className="lg:col-span-7 w-full space-y-16">
          {/* Refined Geometric Service Pillars */}
          <div className="space-y-12">
            {stats.map((item, index) => (
              <motion.div
                key={item.value}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative border-t border-white/10 pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
              >
                <div className="md:col-span-2 font-heading font-black text-2xl tracking-wider text-accent opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
                  {item.value}
                </div>
                
                <div className="md:col-span-10 space-y-2">
                  <h3 className="font-heading font-bold text-lg uppercase tracking-wide text-[var(--text-primary)] group-hover:text-accent transition-colors duration-300">
                    {item.label}
                  </h3>
                  <p className="text-sm opacity-60 font-sans leading-relaxed max-w-xl">
                    {item.desc}
                  </p>
                </div>
                
                <span className="absolute top-0 left-0 w-0 h-[1px] bg-accent transition-all duration-500 group-hover:w-full shadow-[0_0_8px_var(--accent)]" />
              </motion.div>
            ))}
          </div>

          {/* Core Technical Capabilities Graph */}
          <div className="space-y-6 pt-4 border-t border-white/5">
            <h3 className="font-black uppercase tracking-tighter text-[var(--text-primary)]" style={{ fontSize: 'clamp(16px, 2vw, 24px)' }}>
              {content.skills_heading.split(' ').map((word, i, arr) => (
                <span key={i}>
                  {word === '&' ? <span className="text-accent">&</span> : word}
                  {i < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
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
          </div>
        </div>

      </div>
    </section>
  );
}
