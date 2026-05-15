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
    description: 'Complete visual identity systems — logos, color palettes, typography, and brand guidelines that make your business unforgettable.',
  },
  {
    title: 'Photography',
    description: 'Professional photo sessions from portraits to product photography, with expert post-processing in Adobe Lightroom.',
  },
  {
    title: 'Digital Painting',
    description: 'Custom digital illustrations and concept art that bring imagination to canvas with meticulous detail and artistry.',
  },
  {
    title: 'Admin Support',
    description: 'Reliable virtual assistance — email management, scheduling, data entry, and operational support to keep your business running smoothly.',
  },
  {
    title: 'Graphic Design',
    description: 'Stunning layouts for social media, print materials, presentations, and marketing collateral using Photoshop and Canva.',
  },
  {
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
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
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'services');

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
      } catch (e) {
        console.warn('Syncing default content...');
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(bgRef.current, { yPercent: 0 }, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding relative overflow-visible z-40 bg-transparent">
      <div id="services" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />

      <FloatingCube type="Ps" size={120} top="10%" right="5%" blur="4px" delay={0.5} duration={7} />
      <FloatingCube type="Ai" size={60} bottom="20%" left="5%" blur="1px" delay={1.5} duration={5} />

      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent))] opacity-[0.05] blur-[100px]" />
      </div>

      <div ref={ref} className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <p className="text-[10px] font-heading tracking-[0.4em] uppercase text-accent mb-4 font-black">
            {content.subtitle}
          </p>
          <h2 className="font-bold tracking-tighter heading-lg uppercase italic text-[var(--text-primary)]">
            {content.heading}
          </h2>
          <div className="mt-6 w-12 h-1 bg-accent mx-auto" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {servicesData.map((service, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants} 
              className="group p-10 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden flex flex-col items-start min-h-[380px] justify-end cursor-default"
              style={{ 
                 backgroundColor: 'rgba(var(--accent-rgb), 0.03)', 
                 borderColor: 'rgba(var(--accent-rgb), 0.1)',
                 backdropFilter: 'blur(25px) saturate(160%)',
                 WebkitBackdropFilter: 'blur(25px) saturate(160%)',
                 boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* DYNAMIC BG IMAGE LAYER */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={`https://source.unsplash.com/featured/800x1200?${encodeURIComponent(service.title)},dark,minimal`}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover grayscale opacity-10 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-30 group-hover:grayscale-0"
                />
                {/* HEAVIER GRADIENT MASK FOR BETTER READABILITY WITHOUT ICONS */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-[var(--bg-secondary)]/95 to-transparent" />
              </div>

              {/* CONTENT LAYER - NO ICONS */}
              <div className="relative z-10 w-full">
                <h3 className="font-black tracking-tight text-3xl mb-4 uppercase italic transition-colors duration-300 text-[var(--text-primary)] group-hover:text-accent">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed transition-colors duration-300 text-[var(--text-secondary)] opacity-90">
                  {service.description}
                </p>
              </div>

              {/* ACCENT GLOW HOVER */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/5 blur-[50px] rounded-full group-hover:bg-accent/20 transition-colors duration-700 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
