import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, Phone, Instagram, Github, Facebook, Compass, Scale, Headphones, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  onAdminTrigger: () => void;
}

interface FooterContent {
  hook_heading: string;
  hook_desc: string;
  email: string;
  phone: string;
  instagram: string;
  github: string;
  facebook: string;
  copyright: string;
}

const defaultContent: FooterContent = {
  hook_heading: "Want to elevate your visual identity? Let's collaborate.",
  hook_desc: "From brand systems to digital art — I bring ideas to life with precision and passion.",
  email: 'yhanlhester@gmail.com',
  phone: '+639524437988',
  instagram: 'https://www.instagram.com/ilucifer0911/',
  github: 'https://github.com/BogartPagalpok',
  facebook: 'https://www.facebook.com/LordOfTheFlies911',
  copyright: `© ${new Date().getFullYear()} Ian Lester Eclevia. All rights reserved.`,
};

export default function Footer({ onAdminTrigger }: FooterProps) {
  const [content, setContent] = useState<FooterContent>(defaultContent);
  const clickCountRef = useRef(0);
  const footerRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'footer');

      if (data) {
        const mapped = { ...defaultContent };
        data.forEach(row => {
          // Map DB keys to state keys
          const key = row.key as keyof FooterContent;
          if (key in mapped) mapped[key] = row.value;
        });
        setContent(mapped);
      }
    };
    fetchContent();
  }, []);

  // Parallax Effect
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (watermarkRef.current) {
        gsap.fromTo(watermarkRef.current, { yPercent: 10 }, {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1,
          },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="relative bg-midnight overflow-hidden border-t border-white/5">
      <div ref={watermarkRef} className="absolute inset-0 flex items-start justify-center pointer-events-none select-none overflow-hidden">
        <h2 className="text-[12vw] font-heading font-black tracking-widest uppercase opacity-5">IAN LESTER</h2>
      </div>

      <div className="section-container relative z-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Col 1: Hook */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-accent" />
              <span className="text-[10px] uppercase tracking-widest text-accent">Let's Talk</span>
            </div>
            <h3 className="text-2xl font-heading font-bold uppercase mb-4 text-white">{content.hook_heading}</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm">{content.hook_desc}</p>
            <div className="flex gap-4">
              <button onClick={() => scrollToSection('contact')} className="btn-primary text-[10px] px-6 py-3">Book a Call</button>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
             <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-6">Navigation</h4>
             <ul className="space-y-3 text-sm text-zinc-400">
               {['Home', 'Services', 'Works', 'About'].map(item => (
                 <li key={item}><button onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-accent transition-colors">{item}</button></li>
               ))}
             </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
             <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-6">Contact</h4>
             <ul className="space-y-4 text-sm text-zinc-400">
               <li className="flex items-center gap-2"><Mail size={14} className="text-accent" /> {content.email}</li>
               <li className="flex items-center gap-2"><Phone size={14} className="text-accent" /> {content.phone}</li>
             </ul>
          </div>

          {/* Col 4: Connect */}
          <div>
             <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-6">Connect</h4>
             <ul className="space-y-3 text-sm text-zinc-400">
               <li><a href={content.instagram} target="_blank" className="hover:text-accent flex items-center gap-2"><Instagram size={14} /> Instagram</a></li>
               <li><a href={content.github} target="_blank" className="hover:text-accent flex items-center gap-2"><Github size={14} /> GitHub</a></li>
               <li><a href={content.facebook} target="_blank" className="hover:text-accent flex items-center gap-2"><Facebook size={14} /> Facebook</a></li>
             </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5 py-8 section-container flex justify-between items-center text-[10px] text-white/20 uppercase tracking-widest">
        <button onClick={() => { clickCountRef.current++; if(clickCountRef.current >= 5) onAdminTrigger(); }}>{content.copyright}</button>
        <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-accent transition-colors">Back to Top ↑</button>
      </div>
    </footer>
  );
}
