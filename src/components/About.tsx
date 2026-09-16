import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ClapperboardDuotone,
  BrainDuotone,
  PaletteDuotone,
  LayersDuotone,
  AudioWaveformDuotone,
  ImageDuotone,
  FilmDuotone,
  ZapDuotone,
} from './icons/StreamlineIcons';
import { supabase } from '../lib/supabase';
import { formatSectionTitle } from '../lib/formatTitle';

gsap.registerPlugin(ScrollTrigger);

const defaultSkills = [
  { name: 'ADVANCED EDITING (DAVINCI RESOLVE)', level: 95, tag: 'NLE // POST', icon: ClapperboardDuotone },
  { name: 'AUDIENCE PSYCHOLOGY & PACING', level: 90, tag: 'PSYCH // RETENTION', icon: BrainDuotone },
  { name: 'COLOR GRADING & LOOK DEV', level: 88, tag: 'COLOR // LOOK', icon: PaletteDuotone },
  { name: 'MOTION GRAPHICS & COMPOSITING', level: 85, tag: 'VFX // MOTION', icon: LayersDuotone },
  { name: 'SOUND DESIGN & AUDIO MIXING', level: 88, tag: 'AUDIO // SFX', icon: AudioWaveformDuotone },
  { name: 'THUMBNAIL DESIGN (PHOTOSHOP)', level: 92, tag: 'DESIGN // CTR', icon: ImageDuotone },
  { name: 'NARRATIVE STORYTELLING', level: 90, tag: 'STORY // FLOW', icon: FilmDuotone },
  { name: 'AGILE WORKFLOWS & BATCHING', level: 95, tag: 'PIPELINE // SPEED', icon: ZapDuotone },
];

const getSkillMeta = (name: string, index: number) => {
  const match = defaultSkills.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (match) return { icon: match.icon, tag: match.tag };
  const lower = name.toLowerCase();
  if (lower.includes('davinci') || lower.includes('edit')) return { icon: ClapperboardDuotone, tag: 'NLE // POST' };
  if (lower.includes('psych') || lower.includes('pacing')) return { icon: BrainDuotone, tag: 'PSYCH // RETENTION' };
  if (lower.includes('color') || lower.includes('look')) return { icon: PaletteDuotone, tag: 'COLOR // LOOK' };
  if (lower.includes('motion') || lower.includes('compositing')) return { icon: LayersDuotone, tag: 'VFX // MOTION' };
  if (lower.includes('sound') || lower.includes('audio')) return { icon: AudioWaveformDuotone, tag: 'AUDIO // SFX' };
  if (lower.includes('thumbnail') || lower.includes('image')) return { icon: ImageDuotone, tag: 'DESIGN // CTR' };
  if (lower.includes('story') || lower.includes('narrative')) return { icon: FilmDuotone, tag: 'STORY // FLOW' };
  if (lower.includes('agile') || lower.includes('workflow')) return { icon: ZapDuotone, tag: 'PIPELINE // SPEED' };
  return { icon: ClapperboardDuotone, tag: `SPEC // 0${index + 1}` };
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
  description_line1: "I'm Ian Lester Eclevia — a video editor and visual strategist who turns ideas into high-retention, expressive stories. I focus heavily on audience psychology, narrative pacing, and clean post-production to create content that doesn't just look good, but actually performs.",
  description_line2: '',
  description_line3: '',
  skills_heading: 'Skills & Proficiency',
};

export default function About() {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [skills, setSkills] = useState(defaultSkills);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

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
            if (key === 'description_line1' && row.value.includes('graphics artist who turns ideas into clear')) continue;
            if (key === 'description_line2' && row.value.includes('From editing and motion graphics')) continue;
            if (key === 'description_line3' && row.value.includes('My work combines strong visual direction')) continue;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);

          const hasConfiguredSkills = data.some((row) => /^skill_\d+_(name|level)$/.test(row.key.toLowerCase()));
          const isLegacySkills = data.some((row) => row.value === 'Advanced Compositing (Ps)' || row.value === 'Agile Pipelines (Canva Pro)');
          if (hasConfiguredSkills && !isLegacySkills) {
            const skillValues = new Map(data.map((row) => [row.key.toLowerCase(), row.value]));
            setSkills(defaultSkills.flatMap((skill, index) => {
              const name = skillValues.get(`skill_${index + 1}_name`);
              const level = skillValues.get(`skill_${index + 1}_level`);
              return name && level ? [{ name, level: Number(level) || skill.level, tag: skill.tag, icon: skill.icon }] : [];
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
    if (!section) return;

    const ctx = gsap.context(() => {
      // Subtle background parallax
      if (bg) {
        gsap.fromTo(
          bg,
          { yPercent: 0 },
          {
            yPercent: -20,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
          }
        );
      }

      // Kinetic Section Header: sweeps left to right
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { x: -70, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'bottom 15%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      // Left Column (Creative Profile) & Right Column (Skills Grid)
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'bottom 15%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'bottom 15%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const coreTools = ['DaVinci Resolve', 'Photoshop', 'Illustrator', 'Figma'];

  return (
    <section ref={sectionRef} className="relative section-padding overflow-visible z-40 bg-transparent">
      <div id="about" className="absolute -top-20 left-0 w-full h-1 pointer-events-none" />

      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      <div className="section-container relative">
        <div
          ref={headerRef}
          className="text-center mb-10 md:mb-12 flex flex-col items-center will-change-transform"
        >
          <span className="section-subtitle">{content.subtitle}</span>
          <h2 className="section-title">
            {formatSectionTitle(content.heading)}
          </h2>
          <div className="section-divider" />
        </div>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
          
          {/* ── Left Bento Spotlight Card (5 Cols) ── */}
          <div
            ref={leftColRef}
            className="lg:col-span-5 flex will-change-transform"
          >
            <div className="card-dark relative overflow-hidden flex flex-col justify-between w-full h-full border group hover:border-[var(--accent)]/50 transition-all duration-500">
              
              {/* Background Ambient Glow Orbs */}
              <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[var(--accent)]/10 blur-[60px] pointer-events-none group-hover:bg-[var(--accent)]/20 transition-all duration-700" />
              <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-[var(--accent-secondary)]/10 blur-[60px] pointer-events-none group-hover:bg-[var(--accent-secondary)]/20 transition-all duration-700" />

              <div className="relative z-10">
                {/* Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    Creative Profile // Spec
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
                    EST. 2026
                  </span>
                </div>

                {/* Subheading */}
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight mb-5 text-[var(--text-primary)] leading-[1.15]">
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
                {(content.description_line2 || content.description_line3) ? (
                  <div className="space-y-3.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-light">
                    {content.description_line2 && <p>{content.description_line2}</p>}
                    {content.description_line3 && (
                      <p className="italic text-[var(--text-primary)] pl-3 border-l border-[var(--glass-border)]">
                        "{content.description_line3}"
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Creative Software Stack Pills */}
                <div className="pt-6 mt-6 border-t border-[var(--glass-border)]">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 font-bold">
                    Primary Production Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {coreTools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-[var(--glass-border)] bg-white/[0.03] text-[var(--text-secondary)] hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)] transition-all"
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
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">Disciplines</span>
                </div>
                <div className="flex flex-col border-x border-[var(--glass-border)] px-2 text-center">
                  <span className="text-lg sm:text-2xl font-black font-heading text-accent">100%</span>
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">Precision</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-lg sm:text-2xl font-black font-heading text-[var(--accent-secondary)]">4K+</span>
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">Post-Ready</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── Right Bento Skills Grid (7 Cols) ── */}
          <div
            ref={rightColRef}
            className="lg:col-span-7 flex flex-col justify-between space-y-4 will-change-transform"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base sm:text-lg lg:text-xl font-heading font-black uppercase tracking-tight text-[var(--text-primary)]">
                {content.skills_heading}
              </h3>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)] font-bold">
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
                  <div
                    key={skill.name}
                    className="card-dark-sm rounded-xl relative overflow-hidden group hover:border-[var(--accent-secondary)] transition-all duration-300 flex flex-col justify-between"
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
                          <IconComponent
                            size={14}
                            primaryColor={colorConfig.accent}
                            secondaryColor={colorConfig.secondary}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]">
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
                    <h4 className="font-heading font-bold uppercase text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-accent transition-colors mb-3 tracking-tight">
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
                        <div
                          style={{
                            width: `${skill.level}%`,
                            background: `linear-gradient(90deg, ${colorConfig.accent} 0%, ${colorConfig.secondary} 100%)`,
                            boxShadow: `0 0 10px ${colorConfig.accent}66`,
                          }}
                          className="h-full rounded-full relative transition-all duration-1000 ease-out"
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-full shadow-[0_0_6px_#fff]" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
