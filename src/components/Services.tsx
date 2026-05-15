import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const defaultServices = [
  { title: 'Brand Identity', description: 'Complete visual identity systems — logos, color palettes, and typography.', color: 'rgba(157, 0, 255, 0.05)' },
  { title: 'Photography', description: 'Professional photo sessions from portraits to product photography.', color: 'rgba(0, 255, 157, 0.05)' },
  { title: 'Digital Painting', description: 'Custom digital illustrations and concept art that bring imagination to canvas.', color: 'rgba(0, 157, 255, 0.05)' },
  { title: 'Admin Support', description: 'Reliable virtual assistance — email management and operational support.', color: 'rgba(255, 157, 0, 0.05)' },
  { title: 'Graphic Design', description: 'Stunning layouts for social media, print, and marketing collateral.', color: 'rgba(255, 0, 157, 0.05)' },
  { title: 'Videography', description: 'Creative video production and editing with cinematic quality.', color: 'rgba(255, 255, 255, 0.05)' },
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
            }
          });
          setContent(mapped);
          setServicesData(mappedServices);
        }
      } catch (err) {
        console.warn('Fallback active');
      }
    }
    fetchContent();
  }, []);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-transparent">
      <div id="services" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        
        {/* HEADER - SCALED DOWN */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent mb-4">
            {content.subtitle}
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white">
            {content.heading.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="mt-6 w-12 h-1 bg-accent rounded-full" />
        </motion.div>

        {/* COMPACT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="p-8 rounded-2xl border transition-all duration-500 backdrop-blur-xl h-full flex flex-col group relative overflow-hidden"
              style={{ 
                backgroundColor: service.color, 
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <h3 className="font-bold tracking-tight text-xl mb-3 uppercase text-white group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-white/60 group-hover:text-white/90 transition-colors">
                {service.description}
              </p>
              
              {/* HOVER ACCENT */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-accent transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
