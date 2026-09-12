import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Film, Layers, Sparkles, Compass, Cpu, Award, Palette, Type, Zap } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const defaultSkills = [
  { name: 'Video Editing & Post-Production', level: 90 },
  { name: 'Advanced Compositing (Ps)', level: 95 },
  { name: 'Motion Graphics & VFX', level: 85 },
  { name: 'Editorial Photography', level: 92 },
  { name: 'UI/UX Prototyping', level: 88 },
  { name: 'Agile Pipelines (Canva Pro)', level: 95 },
  { name: 'Digital Illustration', level: 90 },
  { name: 'Typography & Grid Systems', level: 87 },
];

const getSkillMeta = (name: string, index: number) => {
  const lower = name.toLowerCase();
  if (lower.includes('video') || lower.includes('edit')) return { icon: Film, tag: 'NLE // POST' };
  if (lower.includes('compositing') || lower.includes('ps') || lower.includes('photo')) return { icon: Layers, tag: 'VFX // RETOUCH' };
  if (lower.includes('motion') || lower.includes('vfx') || lower.includes('fx')) return { icon: Sparkles, tag: '3D // KINETIC' };
  if (lower.includes('editorial') || lower.includes('camera')) return { icon: Compass, tag: 'STILL // FRAME' };
  if (lower.includes('ui') || lower.includes('ux') || lower.includes('proto')) return { icon: Cpu, tag: 'FLOW // SYSTEM' };
  if (lower.includes('pipeline') || lower.includes('canva') || lower.includes('agile')) return { icon: Award, tag: 'PIPELINE // SPEED' };
  if (lower.includes('illustrat') || lower.includes('draw') || lower.includes('art')) return { icon: Palette, tag: 'DIGITAL // ART' };
  if (lower.includes('typograph') || lower.includes('grid') || lower.includes('font')) return { icon: Type, tag: 'LAYOUT // TYPE' };
  return { icon: Zap, tag: `SPEC // 0${index + 1}` };
};

interface AboutContent {
  subtitle: string;
  heading: string;
  subheading: string;
  description_line1: string;
  description_line2: string;
  description_line3: string;
  skills_heading: string;
  [key: `skill_${number}_${'name' | 'level'}`]: string;
}

const defaultContent: AboutContent = {
  subtitle: 'Who I Am',
  heading: 'About & Skills',
  subheading: 'Creative mind. Reliable hands.',
  description_line1: "I'm Ian Lester Eclevia — a video editor and graphics artist who turns ideas into clear, polished, and expressive visual stories.",
  description_line2: "From editing and motion graphics to digital illustration and brand visuals, I shape every frame with purpose, rhythm, and detail.",
  description_line3: "My work combines strong visual direction with careful post-production to create content that feels distinctive and ready to share.",
  skills_heading: 'Skills & Proficiency',
};

export default function About() {
  const { ref, isVisible } = useScrollReveal();
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [skills, setSkills] = useState(defaultSkills);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'about')
          .eq('visible', true);
        if (!error && data && data.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of data) {
            const key = row.key.toLowerCase() as keyof AboutContent;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);
          const skillValues = new Map(data.map((row) => [row.key.toLowerCase(), row.value]));
          const hasConfiguredSkills = data.some((row) => /^skill_\d+_(name|level)$/.test(row.key.toLowerCase()));
          if (hasConfiguredSkills) {
            setSkills(defaultSkills.flatMap((skill, index) => {
              const name = skillValues.get(`skill_${index + 1}_name`);
              const level = skillValues.get(`skill_${index + 1}_level`);
              return name && level ? [{ name, level: Number(level) || skill.level }] : [];
            }));
          }
        }
      } catch {
        // Fallback to default skills and content if network fails
      }
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

  const coreTools = ['Premiere Pro', 'After Effects', 'Photoshop', 'Illustrator', 'Canva Pro', 'Figma'];

  return (
    <section ref={sectionRef} className="relative section-padding overflow-visible z-40 bg-transparent">
      <div id="about" className="absolute -top-20 left-0 w-full h-1 pointer-events-none" />

      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      <div ref={ref} className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12 flex flex-col items-center"
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

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
          
          {/* ── Left Bento Spotlight Card (5 Cols) ── */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex"
          >
            <div className="card-dark !p-6 sm:!p-8 relative overflow-hidden flex flex-col justify-between w-full h-full border group hover:border-[var(--accent)]/50 transition-all duration-500">
              
              {/* Background Ambient Glow Orbs */}
              <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[var(--accent)]/10 blur-[60px] pointer-events-none group-hover:bg-[var(--accent)]/20 transition-all duration-700" />
              <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-[var(--accent-secondary)]/10 blur-[60px] pointer-events-none group-hover:bg-[var(--accent-secondary)]/20 transition-all duration-700" />

              <div className="relative z-10">
                {/* Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    Creative Profile // Spec
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-[var(--text-primary)]/40 tracking-widest uppercase">
                    EST. 2026
                  </span>
                </div>

                {/* Subheading */}
                <h3 className="font-heading font-black tracking-tight mb-5 text-[var(--text-primary)] leading-[1.15]" style={{ fontSize: 'clamp(20px, 2.2vw, 30px)' }}>
                  {content.subheading.includes('.') ? (
                    <>
                      <span>{content.subheading.split('.')[0]}.</span>{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]">
                        {content.subheading.split('.')[1].trim()}
                      </span>
                    </>
                  ) : (
                    content.subheading
                  )}
                </h3>

                {/* Description Line 1 — Editorial Lead Feature */}
                <div className="border-l-2 border-[var(--accent)] pl-4 py-1.5 mb-5 bg-white/[0.02] rounded-r-xl">
                  <p className="text-sm sm:text-base leading-relaxed text-[var(--text-primary)] font-medium">
                    {content.description_line1}
                  </p>
                </div>

                {/* Description Line 2 & 3 */}
                <div className="space-y-3.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-light">
                  <p>{content.description_line2}</p>
                  <p className="italic text-[var(--text-primary)]/80 pl-3 border-l border-white/10">
                    "{content.description_line3}"
                  </p>
                </div>

                {/* Creative Software Stack Pills */}
                <div className="pt-6 mt-6 border-t border-[var(--glass-border)]">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-primary)]/50 mb-3 font-bold">
                    Primary Production Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {coreTools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-md border border-[var(--glass-border)] bg-white/[0.03] text-[var(--text-primary)]/75 hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)] transition-all"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics / Key highlights bar */}
              <div className="pt-6 mt-6 border-t border-[var(--glass-border)] grid grid-cols-3 gap-2 relative z-10">
                <div className="flex flex-col">
                  <span className="text-lg sm:text-2xl font-black font-heading text-[var(--text-primary)]">8+</span>
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">Disciplines</span>
                </div>
                <div className="flex flex-col border-x border-[var(--glass-border)] px-2 text-center">
                  <span className="text-lg sm:text-2xl font-black font-heading text-accent">100%</span>
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">Precision</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-lg sm:text-2xl font-black font-heading text-[var(--accent-secondary)]">4K+</span>
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">Post-Ready</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* ── Right Bento Skills Grid (7 Cols) ── */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-7 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading font-black uppercase tracking-tight text-[var(--text-primary)]" style={{ fontSize: 'clamp(16px, 1.8vw, 22px)' }}>
                {content.skills_heading}
              </h3>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                {skills.length} Core Capabilities
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 flex-1">
              {skills.map((skill, i) => {
                const paletteConfigs = [
                  { accent: 'var(--accent)', secondary: 'var(--accent-secondary)' },
                  { accent: 'var(--accent-secondary)', secondary: 'var(--accent-tertiary, var(--accent))' },
                  { accent: 'var(--accent-tertiary, var(--accent))', secondary: 'var(--accent)' },
                ];
                const colorConfig = paletteConfigs[i % paletteConfigs.length];
                const meta = getSkillMeta(skill.name, i);
                const IconComponent = meta.icon;

                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.45, delay: 0.25 + i * 0.04 }}
                    className="card-dark !p-4 rounded-xl relative overflow-hidden group hover:border-[var(--accent-secondary)] transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Row: Icon, Tag & Percentage Pill */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center border"
                          style={{
                            backgroundColor: `${colorConfig.accent}15`,
                            borderColor: `${colorConfig.accent}30`,
                            color: colorConfig.accent,
                          }}
                        >
                          <IconComponent size={12} />
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--text-primary)]/50">
                          {meta.tag}
                        </span>
                      </div>

                      <span
                        className="text-xs font-mono font-black px-2 py-0.5 rounded-md border"
                        style={{
                          color: colorConfig.accent,
                          borderColor: `${colorConfig.accent}40`,
                          backgroundColor: `${colorConfig.accent}12`,
                        }}
                      >
                        {skill.level}%
                      </span>
                    </div>

                    {/* Skill Name */}
                    <h4 className="font-heading font-bold uppercase text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-white transition-colors mb-3 tracking-tight">
                      {skill.name}
                    </h4>

                    {/* Modern High-Tech HUD Progress Track */}
                    <div>
                      <div
                        className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10"
                        role="progressbar"
                        aria-label={`${skill.name} proficiency`}
                        aria-valuenow={skill.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={isVisible ? { width: `${skill.level}%` } : {}}
                          transition={{ duration: 1.2, delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            background: `linear-gradient(90deg, ${colorConfig.accent} 0%, ${colorConfig.secondary} 100%)`,
                            boxShadow: `0 0 10px ${colorConfig.accent}66`,
                          }}
                          className="h-full rounded-full relative"
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full shadow-[0_0_6px_#fff]" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
