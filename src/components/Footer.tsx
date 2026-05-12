import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, Instagram, Github, Facebook, Sparkles } from 'lucide-react';
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
  const watermarkRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'footer');

      if (data) {
        const mapped = { ...defaultContent };
        data.forEach(row => {
          const key = row.key as keyof FooterContent;
          if (key in mapped) mapped[key] = row.value;
        });
        setContent(mapped);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (watermarkRef.current) {
        gsap.fromTo(watermarkRef.current, 
          { x: 30, opacity: 0 }, 
          { 
            x: 0, 
            opacity: 1, 
            duration: 1.2, 
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 95%",
            }
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="relative bg-transparent overflow-visible mt-20">
      <div className="section-container relative pb-12">
        
        <div 
          className="relative z-10 p-10 md:p-16 rounded-[40px] border transition-all duration-500 backdrop-blur-[32px] saturate-[180%] overflow-hidden flex flex-col justify-between min-h-[550px]"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.02)', 
            borderColor: 'rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)'
          }}
        >
          {/* TOP SECTION */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-accent" />
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold font-heading">Let's Talk</span>
              </div>
              <h3 className="text-4xl font-heading font-black uppercase mb-4 leading-tight" style={{ color: '#ffffff' }}>{content.hook_heading}</h3>
              <p className="text-base mb-8 max-w-sm leading-relaxed" style={{ color: '#efefef', opacity: 0.6 }}>{content.hook_desc}</p>
              <button onClick={() => scrollToSection('contact')} className="btn-primary text-[10px] px-8 py-4 uppercase tracking-widest font-bold" style={{ background: 'var(--accent)', color: '#000000' }}>Book a Call</button>
            </div>

            <div className="hidden lg:block" /> {/* Spacer */}

            <div>
               <h4 className="text-[10px] uppercase tracking-widest mb-6 font-bold opacity-30 font-heading" style={{ color: '#ffffff' }}>Navigation</h4>
               <ul className="space-y-4 text-sm font-medium">
                 {['Home', 'Services', 'Works', 'About'].map(item => (
                   <li key={item}><button onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-accent transition-colors" style={{ color: '#efefef' }}>{item}</button></li>
                 ))}
               </ul>
            </div>

            <div>
               <h4 className="text-[10px] uppercase tracking-widest mb-6 font-bold opacity-30 font-heading" style={{ color: '#ffffff' }}>Contact</h4>
               <ul className="space-y-4 text-sm font-medium" style={{ color: '#efefef' }}>
                 <li className="flex items-center gap-3"><Mail size={14} className="text-accent" /> {content.email}</li>
                 <li className="flex items-center gap-3"><Phone size={14} className="text-accent" /> {content.phone}</li>
               </ul>
            </div>
          </div>

          {/* BOTTOM SECTION: Fits exactly in the circled gap */}
          <div className="relative mt-auto flex flex-col items-end pt-12">
            {/* The name is now properly scaled and right-justified */}
            <h2 
              ref={watermarkRef}
              className="text-6xl md:text-8xl lg:text-[7vw] font-heading font-black tracking-tighter uppercase leading-none pointer-events-none select-none" 
              style={{ 
                color: '#ffffff',
                opacity: 0.85,
              }}
            >
              IAN LESTER
            </h2>
            
            {/* Copyright divider sitting right under the name */}
            <div className="w-full mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest opacity-40 font-heading font-bold">
              <button onClick={() => { clickCountRef.current++; if(clickCountRef.current >= 5) onAdminTrigger(); }}>{content.copyright}</button>
              <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-accent transition-colors">Back to Top ↑</button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
