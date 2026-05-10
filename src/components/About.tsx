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
  description_line1: "I'm Ian Lester Eclevia \u2014 a graphic designer, photographer, and virtual assistant who believes that great design is where timeless elegance meets modern trends.",
  description_line2: "With deep proficiency in Photoshop, digital painting, and photography, I craft visual stories that don't just look beautiful \u2014 they communicate, connect, and convert.",
  description_line3: "Beyond design, I bring the same dedication to virtual assistance \u2014 organized, proactive, and committed to making your operations run seamlessly.",
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
    <section id="about" ref={sectionRef} className="section-padding bg-black relative overflow-hidden">
      {/* Floating 3D Identities */}
      <FloatingCube type="Canva" size={100} top="5%" right="10%" blur="3px" delay={0.3} duration={7} />
      <FloatingCube type="Id" size={70} bottom="15%" left="10%" blur="1px" delay={1.2} duration={5} />

      {/* Parallax depth layer */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/3 via-transparent to-transparent" />
        <div
          className="absolute top-32 -right-20 text-[10vw] font-heading font-black tracking-widest uppercase select-none whitespace-nowrap text-white/[0.03]"
        >
        
        </div>
        <div
          className="absolute bottom-0 left-10 text-[5vw] font-heading font-black tracking-widest uppercase select-none whitespace-nowrap text-white/[0.03]"
        >
          
        </div>
      </div>

      <div ref={ref} className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
            {content.subtitle}
          </p>
          <h2 className="text-white font-bold tracking-tighter heading-lg">
            {content.heading.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative">
              <div className="card-dark relative border-white/5">
                <h3 className="text-white font-bold tracking-tighter heading-md mb-6 text-xl">
                  {content.subheading.includes('.') ? (
                    <>
                      {content.subheading.split('.')[0]}. <span className="text-accent">{content.subheading.split('.')[1].trim()}.</span>
                    </>
                  ) : (
                    content.subheading
                  )}
                </h3>
                <div className="space-y-4 text-zinc-400 leading-relaxed">
                  <p>{content.description_line1}</p>
                  <p>{content.description_line2}</p>
                  <p>{content.description_line3}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h3 className="text-white font-bold tracking-tighter heading-md mb-8 text-xl">
              {content.skills_heading.split(' ').map((word, i, arr) => (
                <span key={i}>
                  {word === '&' ? <span className="text-accent">&</span> : word}
                  {i === arr.length - 1 && !content.skills_heading.includes('&') ? <span className="text-accent">{word}</span> : (word === 'Proficiency' ? <span className="text-accent">{word}</span> : word)}
                  {i < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h3>
            <div className="space-y-5">
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-heading font-bold tracking-widest uppercase text-white/70">
                      {skill.name}
                    </span>
                    <span className="text-xs font-heading font-black text-accent">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="h-2 rounded-none overflow-hidden bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isVisible ? { width: `${skill.level}%` } : {}}
                      transition={{ duration: 1, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                      className="h-full bg-accent"
                      style={{ boxShadow: '0 0 10px rgba(255, 0, 122, 0.4)' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
