import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { supabase } from '../lib/supabase';
import FloatingCube from './FloatingCube';

gsap.registerPlugin(ScrollTrigger);

const defaultServices = [
  {
    title: 'Brand Identity',
    description: 'Complete visual identity systems — logos, color palettes, typography, and brand guidelines.',
    color: 'rgba(157, 0, 255, 0.05)'
  },
  {
    title: 'Photography',
    description: 'Professional photo sessions from portraits to product photography, with expert post-processing.',
    color: 'rgba(0, 255, 157, 0.05)'
  },
  {
    title: 'Digital Painting',
    description: 'Custom digital illustrations and concept art that bring imagination to canvas.',
    color: 'rgba(0, 157, 255, 0.05)'
  },
  {
    title: 'Admin Support',
    description: 'Reliable virtual assistance — email management, scheduling, and operational support.',
    color: 'rgba(255, 157, 0, 0.05)'
  },
  {
    title: 'Graphic Design',
    description: 'Stunning layouts for social media, print materials, and marketing collateral.',
    color: 'rgba(255, 0, 157, 0.05)'
  },
  {
    title: 'Videography',
    description: 'Creative video production and editing that tells your story with cinematic quality.',
    color: 'rgba(255, 255, 255, 0.05)'
  },
];

interface ServicesContent {
  subtitle: string;
  heading: string;
}

const defaultContent: ServicesContent = {
  subtitle: 'What I Do',
  heading: 'Services & Expertise',
};

export default function Services() {
  const { ref, isVisible } = useScrollReveal();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<ServicesContent>(defaultContent);
  const [servicesData, setServicesData] = useState(defaultServices);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase.from('site_content').select('key, value').eq('section', 'services');
        if (!error && data && data.length > 0) {
          const mappedContent = { ...defaultContent };
          const mappedServices = [...defaultServices];
          data.forEach((row) => {
            const key = row.key.toLowerCase();
            if (key === 'subtitle') mappedContent.subtitle = row.value;
            if (key === 'heading') mappedContent.heading = row.value;
            for (let i = 1; i <= 6; i++) {
              if (key === `service${i}_title`) mappedServices[i - 1].title = row.value;
              if (key === `service${i}_desc`) mappedServices[i - 1].description = row.value;
            }
          });
          setContent(mappedContent);
          setServicesData(mappedServices);
        }
      } catch (e) { console.warn('Syncing default content...'); }
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
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative section-padding overflow-visible z-40 bg-transparent">
      <div id="services" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />

      <FloatingCube type="Ps" size={100} top="10%" right="5%" blur="4px" delay={0.5} duration={7} />
      <FloatingCube type="Ai" size={50} bottom="20%" left="5%" blur="1px" delay={1.5} duration={5} />

      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent)/0.03,_transparent_70%)]" />
      </div>

      <div ref={ref} className="section-container relative">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <p className="text-xs font-heading tracking-[0.4em] uppercase text-accent mb-4 font-bold">
            {content.subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white">
            {content.heading.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="mt-6 w-12 h-1 bg-accent rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {servicesData.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              className="p-8 rounded-2xl border transition-all duration-500 backdrop-blur-xl h-full flex flex-col group relative overflow-hidden"
              style={{ 
                backgroundColor: service.color || 'rgba(255, 255, 255, 0.02)', 
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <h3 className="font-bold tracking-tight text-xl mb-3 uppercase leading-tight group-hover:text-accent transition-colors text-white">
                {service.title}
              </h3>
              
              <p className="text-sm font-light leading-relaxed text-white/60 group-hover:text-white/90 transition-colors duration-300">
                {service.description}
              </p>

              <div className="absolute bottom-0 left-0 w-0 h-1 bg-accent transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
