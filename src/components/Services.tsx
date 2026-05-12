import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Camera, PenTool, Headphones, LayoutGrid as Layout, Video } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { supabase } from '../lib/supabase';
import FloatingCube from './FloatingCube';

gsap.registerPlugin(ScrollTrigger);

const defaultServices = [
  {
    icon: Palette,
    title: 'Brand Identity',
    description: 'Complete visual identity systems — logos, color palettes, typography, and brand guidelines that make your business unforgettable.',
  },
  {
    icon: Camera,
    title: 'Photography',
    description: 'Professional photo sessions from portraits to product photography, with expert post-processing in Adobe Lightroom.',
  },
  {
    icon: PenTool,
    title: 'Digital Painting',
    description: 'Custom digital illustrations and concept art that bring imagination to canvas with meticulous detail and artistry.',
  },
  {
    icon: Headphones,
    title: 'Admin Support',
    description: 'Reliable virtual assistance — email management, scheduling, data entry, and operational support to keep your business running smoothly.',
  },
  {
    icon: Layout,
    title: 'Graphic Design',
    description: 'Stunning layouts for social media, print materials, presentations, and marketing collateral using Photoshop and Canva.',
  },
  {
    icon: Video,
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
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
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

        if (error) throw error;

        if (data && data.length > 0) {
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
      } catch (e: any) {
        console.warn('Using default services content due to fetch error:', e.message);
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
    <section ref={sectionRef} className="section-padding relative overflow-visible z-40 bg-transparent">
      {/* ANCHOR FIX */}
      <div id="services" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />

      {/* Floating 3D Identities */}
      <FloatingCube type="Ps" size={120} top="10%" right="5%" blur="4px" delay={0.5} duration={7} />
      <FloatingCube type="Ai" size={60} bottom="20%" left="5%" blur="1px" delay={1.5} duration={5} />

      {/* Parallax depth layer */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--accent)]/5 via-transparent to-transparent" />
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
          <h2 className="font-bold tracking-tighter heading-lg" style={{ color: '#ffffff' }}>
            {content.heading.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word === '&' ? <span className="text-accent">&</span> : word}
                {i < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
          <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {servicesData.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div 
                key={index} 
                variants={itemVariants} 
                className="group p-8 rounded-3xl border transition-all duration-500 backdrop-blur-[32px] saturate-[180%]"
                style={{ 
                   backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                   borderColor: 'rgba(255, 255, 255, 0.12)',
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                   WebkitBackdropFilter: 'blur(32px) saturate(180%)'
                }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 group-hover:scale-110 group-hover:bg-accent group-hover:border-accent group-hover:shadow-[0_0_20px_var(--accent)]">
                  <Icon size={28} className="text-accent transition-colors duration-500 group-hover:text-[var(--accent-contrast)]" />
                </div>
                
                <h3 className="font-bold tracking-tighter text-xl mb-3 transition-colors duration-300 group-hover:text-accent" style={{ color: '#ffffff' }}>
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed transition-colors duration-300 group-hover:text-[#ffffff]" style={{ color: '#efefef' }}>
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
