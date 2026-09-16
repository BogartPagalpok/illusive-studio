import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { formatSectionTitle } from '../lib/formatTitle';

gsap.registerPlugin(ScrollTrigger);

const defaultServices = [
  {
    title: 'LONG-FORM EDITING',
    description: 'Crafting 10 to 40-minute video essays and gaming content with deliberate pacing, narrative flow, and high audience retention in DaVinci Resolve.',
    color: 'transparent',
  },
  {
    title: 'SHORT-FORM CONTENT',
    description: 'Pulling the best moments for YouTube Shorts and TikTok, optimized for immediate hooks, fast pacing, and algorithmic performance.',
    color: 'transparent',
  },
  {
    title: 'THUMBNAIL & CTR DESIGN',
    description: 'Designing high-contrast, psychology-driven thumbnails in Photoshop built specifically to maximize Click-Through Rates (CTR) and viewer curiosity.',
    color: 'transparent',
  },
  {
    title: 'COLOR GRADING & LOOK DEV',
    description: "Building custom cinematic grades and color pipelines to establish atmosphere, mood, and visual consistency across your channel's branding.",
    color: 'transparent',
  },
  {
    title: 'SOUND DESIGN & MIXING',
    description: 'Enhancing narrative storytelling with immersive SFX, clean vocal EQ, and dynamic audio mixing to keep viewers fully engaged.',
    color: 'transparent',
  },
  {
    title: 'RETENTION STRATEGY',
    description: 'Collaborating on script structure, pacing adjustments, and analytical feedback to grow overall watch hours and drive channel monetization.',
    color: 'transparent',
  },
];

export default function Services() {
  const [content, setContent] = useState({ subtitle: 'What I Do', heading: 'Services & Expertise' });
  const [servicesData, setServicesData] = useState(defaultServices);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'services')
          .eq('visible', true);
        if (!error && data && data.length > 0) {
          const mapped = { subtitle: 'What I Do', heading: 'Services & Expertise' };
          const mappedServices = [...defaultServices];
          const isLegacyServices = data.some(
            (row) => row.value === 'Graphic Design' || row.value === 'Visual Content Production'
          );
          data.forEach((row) => {
            const key = row.key.toLowerCase();
            if (key === 'subtitle') mapped.subtitle = row.value;
            if (key === 'heading') mapped.heading = row.value;
            if (!isLegacyServices) {
              for (let i = 1; i <= 6; i++) {
                if (key === `service${i}_title`) mappedServices[i - 1].title = row.value;
                if (key === `service${i}_desc`) mappedServices[i - 1].description = row.value;
                if (key === `service${i}_color`) mappedServices[i - 1].color = row.value;
              }
            }
          });
          setContent(mapped);
          if (!isLegacyServices) {
            setServicesData(mappedServices);
          }
        }
      } catch { console.warn('Fallback active'); }
    }
    fetchContent();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Kinetic header sweep from left to right
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
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 6 Services cards staggered sweep from left/bottom
      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.children;
        gsap.fromTo(
          cards,
          { x: -30, y: 35, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'bottom 15%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [servicesData]);

  return (
    <section ref={sectionRef} className="section-padding bg-transparent relative overflow-hidden">
      <div id="services" className="absolute -top-20 left-0 w-full h-1 pointer-events-none" />
      <div className="section-container relative">
        <div
          ref={headerRef}
          className="section-header-gap text-center flex flex-col items-center will-change-transform"
        >
          <span className="section-subtitle">{content.subtitle}</span>
          <h2 className="section-title">
            {formatSectionTitle(content.heading)}
          </h2>
          <div className="section-divider" />
        </div>

        <div ref={cardsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {servicesData.map((service, index) => {
            const palette = [
              'var(--accent)',
              'var(--accent-secondary)',
              'var(--accent-tertiary, var(--accent))',
            ];
            const cardAccent = palette[index % palette.length];

            return (
              <div
                key={index}
                className="card-dark h-full flex flex-col group relative cursor-pointer will-change-transform"
                style={{ backgroundColor: service.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-heading font-black tracking-widest uppercase opacity-85 group-hover:opacity-100 transition-opacity"
                    style={{ color: cardAccent }}
                  >
                    0{index + 1} //
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-heading font-bold tracking-tight uppercase text-[var(--text-primary)] transition-colors mb-2">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm font-body leading-relaxed text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {service.description}
                </p>
                <div
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: cardAccent }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
