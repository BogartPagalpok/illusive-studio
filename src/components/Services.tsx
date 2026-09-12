import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

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

import { formatSectionTitle } from '../lib/formatTitle';

export default function Services() {
  const [content, setContent] = useState({ subtitle: 'What I Do', heading: 'Services & Expertise' });
  const [servicesData, setServicesData] = useState(defaultServices);

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

  return (
    <section className="section-padding bg-transparent relative overflow-hidden">
      <div id="services" className="absolute -top-20 left-0 w-full h-1 pointer-events-none" />
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <span className="section-subtitle">{content.subtitle}</span>
          <h2 className="section-title">
            {formatSectionTitle(content.heading)}
          </h2>
          <div className="section-divider" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {servicesData.map((service, index) => {
            const palette = [
              'var(--accent)',
              'var(--accent-secondary)',
              'var(--accent-tertiary, var(--accent))',
            ];
            const cardAccent = palette[index % palette.length];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="card-dark h-full flex flex-col group relative cursor-pointer"
                style={{ backgroundColor: service.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[9px] font-heading font-black tracking-widest uppercase opacity-75 group-hover:opacity-100 transition-opacity"
                    style={{ color: cardAccent }}
                  >
                    0{index + 1} //
                  </span>
                </div>
                <h3
                  className="font-bold tracking-tight uppercase text-[var(--text-primary)] transition-colors mb-1.5"
                  style={{ fontSize: 'clamp(12px, 1.2vw, 18px)' }}
                >
                  {service.title}
                </h3>
                <p
                  className="font-light leading-relaxed text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors"
                  style={{ fontSize: 'clamp(10px, 0.9vw, 14px)' }}
                >
                  {service.description}
                </p>
                <div
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: cardAccent }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
