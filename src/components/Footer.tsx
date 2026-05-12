import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, Instagram, Github, Facebook, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-transparent overflow-visible mt-10 font-heading">
      <div className="section-container relative pb-12">
        
        <div 
          className="relative z-10 p-8 md:p-12 rounded-[40px] border transition-all duration-500 backdrop-blur-[32px] saturate-[180%]"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.02)', 
            borderColor: 'rgba(255, 255, 255, 0.12)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)'
          }}
        >
          {/* WATERMARK: Positioned 10px above the line, 60% Opacity */}
          <h2 
            className="absolute bottom-[88px] right-8 md:right-12 text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-none text-white pointer-events-none select-none z-0" 
            style={{ 
              opacity: 0.6,
              transform: 'translateX(0.04em)' 
            }}
          >
            IAN LESTER
          </h2>

          {/* GRID STRUCTURE */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start mb-16 md:mb-20">
            {/* Hook */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-accent" />
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Let's Talk</span>
              </div>
              <h3 className="text-2xl font-black uppercase mb-3 leading-tight text-white">{content.hook_heading}</h3>
              <p className="text-[11px] mb-5 max-w-sm leading-relaxed text-white/60">{content.hook_desc}</p>
              <button onClick={() => scrollToSection('contact')} className="btn-primary text-[10px] px-6 py-3 uppercase tracking-widest font-bold" style={{ background: 'var(--accent)', color: '#000000' }}>Book a Call</button>
            </div>

            {/* Navigation */}
            <div>
               <h4 className="text-[9px] uppercase tracking-widest mb-4 font-bold opacity-30 text-white">Navigation</h4>
               <ul className="space-y-2 text-[11px] text-white/80">
                 {['Home', 'Services', 'Works', 'About'].map(item => (
                   <li key={item}><button onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-accent transition-colors">{item}</button></li>
                 ))}
               </ul>
            </div>

            {/* Contact & Connect Unified */}
            <div>
               <h4 className="text-[9px] uppercase tracking-widest mb-4 font-bold opacity-30 text-white">Contact</h4>
               <ul className="space-y-4 text-[11px] text-white/80">
                 <li className="flex items-center gap-2"><Mail size={12} className="text-accent" /> {content.email}</li>
                 <li className="flex items-center gap-2 mb-6"><Phone size={12} className="text-accent" /> {content.phone}</li>
                 
                 <li className="pt-2 border-t border-white/5 flex flex-col gap-3">
                    <a href={content.instagram} target="_blank" className="hover:text-accent flex items-center gap-2 transition-colors"><Instagram size={12} /> Instagram</a>
                    <a href={content.github} target="_blank" className="hover:text-accent flex items-center gap-2 transition-colors"><Github size={12} /> GitHub</a>
                    <a href={content.facebook} target="_blank" className="hover:text-accent flex items-center gap-2 transition-colors"><Facebook size={12} /> Facebook</a>
                 </li>
               </ul>
            </div>
          </div>
            
          {/* FLARE LINE: 60% Opacity */}
          <div 
            className="relative z-10 mt-2 pt-6 border-t flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-white" 
            style={{ borderColor: 'rgba(255, 255, 255, 0.6)', opacity: 0.6 }}
          >
            <button onClick={() => { clickCountRef.current++; if(clickCountRef.current >= 5) onAdminTrigger(); }}>{content.copyright}</button>
            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-accent transition-colors">Back to Top ↑</button>
          </div>

        </div>
      </div>
    </footer>
  );
}
