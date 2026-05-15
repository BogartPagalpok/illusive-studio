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
    icon: 'line-md:edit-twotone',
    title: 'Brand Identity',
    description: 'Complete visual identity systems — logos, color palettes, typography, and brand guidelines that make your business unforgettable.',
  },
  {
    icon: 'line-md:image-twotone',
    title: 'Photography',
    description: 'Professional photo sessions from portraits to product photography, with expert post-processing in Adobe Lightroom.',
  },
  {
    icon: 'line-md:paint-palette-twotone',
    title: 'Digital Painting',
    description: 'Custom digital illustrations and concept art that bring imagination to canvas with meticulous detail and artistry.',
  },
  {
    icon: 'line-md:clipboard-list-twotone',
    title: 'Admin Support',
    description: 'Reliable virtual assistance — email management, scheduling, data entry, and operational support to keep your business running smoothly.',
  },
  {
    icon: 'line-md:document-list-twotone',
    title: 'Graphic Design',
    description: 'Stunning layouts for social media, print materials, presentations, and marketing collateral using Photoshop and Canva.',
  },
  {
    icon: 'line-md:video-twotone',
    title: 'Videography',
    description: 'Creative video production and editing that tells your story with cinematic quality and compelling narrative flow.',
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

  // RESTORED: GSAP Parallax from About.tsx
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

      {/* Floating 3D Elements */}
      <FloatingCube type="Ps" size={120} top="10%" right="5%" blur="4px" delay={0.5} duration={7} />
      <FloatingCube type="Ai" size={60} bottom="20%" left="5%" blur="1px" delay={1.5} duration={5} />

      {/* RESTORED: Parallax Background from About.tsx */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent)/0.05,_transparent_70%)]" />
      </div>

      <div ref={ref} className="section-container relative">
        {/* REPLICATED TITLE BLOCK FROM ABOUT.TSX */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
            {content.subtitle}
          </p>
          <h2 className="font-bold tracking-tighter heading-lg uppercase" style={{ color: '#ffffff' }}>
            {content.heading.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
        </motion.div>

        {/* REPLICATED GRID & CARD STRUCTURE FROM ABOUT.TSX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {servicesData.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + index * 0.1 }}
              className="p-10 rounded-3xl border transition-all duration-500 backdrop-blur-[32px] saturate-[180%] h-full flex flex-col group relative"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                borderColor: 'rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)'
              }}
            >
              <div className="mb-8 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-accent group-hover:border-accent">
                <iconify-icon 
                  icon={service.icon} 
                  style={{ fontSize: '32px', color: 'var(--accent)', transition: 'color 0.5s ease' }}
                  className="group-hover:!text-white"
                />
              </div>
              
              <h3 className="font-bold tracking-tighter text-2xl mb-4 uppercase leading-tight group-hover:text-accent transition-colors" style={{ color: '#ffffff' }}>
                {service.title}
              </h3>
              
              <p className="text-lg font-light leading-relaxed transition-colors duration-300" style={{ color: '#efefef' }}>
                {service.description}
              </p>

              {/* Decorative radial glow from original */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/5 blur-[50px] rounded-full group-hover:bg-accent/15 transition-colors duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
