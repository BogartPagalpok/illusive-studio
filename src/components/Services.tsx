import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const defaultServices = [
  { title: 'Brand Identity', description: 'Complete visual identity systems...', color: 'transparent' },
  { title: 'Photography', description: 'Professional photo sessions...', color: 'transparent' },
  { title: 'Digital Painting', description: 'Custom digital illustrations...', color: 'transparent' },
  { title: 'Admin Support', description: 'Reliable virtual assistance...', color: 'transparent' },
  { title: 'Graphic Design', description: 'Stunning layouts...', color: 'transparent' },
  { title: 'Videography', description: 'Creative video production...', color: 'transparent' },
];

// Different parallax speeds per card
const parallaxClasses = [
  'parallax-slow',
  'parallax-medium',
  'parallax-slow',
  'parallax-fast',
  'parallax-medium',
  'parallax-reverse',
];

export default function Services() {
  const [content, setContent] = useState({ subtitle: 'What I Do', heading: 'Services & Expertise' });
  const [servicesData, setServicesData] = useState(defaultServices);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'services');
        if (!error && data && data.length > 0) {
          const mapped = { subtitle: 'What I Do', heading: 'Services & Expertise' };
          const mappedServices = [...defaultServices];
          data.forEach((row) => {
            const key = row.key.toLowerCase();
            if (key === 'subtitle') mapped.subtitle = row.value;
            if (key === 'heading') mapped.heading = row.value;
            for (let i = 1; i <= 6; i++) {
              if (key === `service${i}_title`) mappedServices[i - 1].title = row.value;
              if (key === `service${i}_desc`) mappedServices[i - 1].description = row.value;
              if (key === `service${i}_color`) mappedServices[i - 1].color = row.value;
            }
          });
          setContent(mapped);
          setServicesData(mappedServices);
        }
      } catch (err) { console.warn('Fallback active'); }
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
            {content.heading.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="section-divider" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {servicesData.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className={`card-dark h-full flex flex-col group relative cursor-pointer ${parallaxClasses[index]}`}
              style={{ backgroundColor: service.color }}
            >
              <h3 className="font-bold tracking-tight uppercase text-[var(--text-primary)] group-hover:text-accent transition-colors mb-1.5" style={{ fontSize: 'clamp(12px, 1.2vw, 18px)' }}>
                {service.title}
              </h3>
              <p className="font-light leading-relaxed text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" style={{ fontSize: 'clamp(10px, 0.9vw, 14px)' }}>
                {service.description}
              </p>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
