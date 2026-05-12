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
  { icon: Palette, title: 'Brand Identity', description: 'Complete visual identity systems — logos, color palettes, typography, and brand guidelines that make your business unforgettable.' },
  { icon: Camera, title: 'Photography', description: 'Professional photo sessions from portraits to product photography, with expert post-processing in Adobe Lightroom.' },
  { icon: PenTool, title: 'Digital Painting', description: 'Custom digital illustrations and concept art that bring imagination to canvas with meticulous detail and artistry.' },
  { icon: Headphones, title: 'Admin Support', description: 'Reliable virtual assistance — email management, scheduling, data entry, and operational support to keep your business running smoothly.' },
  { icon: Layout, title: 'Graphic Design', description: 'Stunning layouts for social media, print materials, presentations, and marketing collateral using Photoshop and Canva.' },
  { icon: Video, title: 'Videography', description: 'Creative video production and editing that tells your story with cinematic quality and compelling narrative flow.' },
];

export default function Services() {
  const { ref, isVisible } = useScrollReveal();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState({ subtitle: 'What I Do', heading: 'Services & Expertise' });
  const [servicesData, setServicesData] = useState(defaultServices);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase.from('site_content').select('key, value').eq('section', 'services');
        if (data && data.length > 0) {
          const mappedContent = { ...content };
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
      } catch (e) {}
    };
    fetchContent();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding relative overflow-visible z-40 bg-transparent">
      <div id="services" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />
      <div className="section-container relative">
        <div className="text-center mb-16">
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">{content.subtitle}</p>
          <h2 className="text-[var(--text-primary)] font-bold tracking-tighter heading-lg uppercase">{content.heading}</h2>
          <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="p-8 rounded-3xl border transition-all duration-500 backdrop-blur-3xl"
                   style={{ backgroundColor: 'rgba(10, 10, 12, 0.4)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 text-accent">
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>{service.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
