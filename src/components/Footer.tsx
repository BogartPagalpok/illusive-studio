import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, Instagram, Github, Facebook, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Footer({ onAdminTrigger }: { onAdminTrigger: () => void }) {
  const [content, setContent] = useState<any>(null);
  const clickCountRef = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('site_content').select('key, value').eq('section', 'footer');
      if (data) {
        const mapped = data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
        setContent(mapped);
      }
    };
    fetchContent();
  }, []);

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="relative bg-transparent overflow-visible mt-10 font-heading">
      <div className="section-container relative pb-12">
        <div 
          className="relative z-10 p-6 sm:p-8 md:p-12 rounded-[40px] border transition-all duration-500 backdrop-blur-[32px] saturate-[180%]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.12)' }}
        >
          {/* WATERMARK: Adjusted bottom positioning for mobile stacking and used dynamic viewport width (vw) to prevent overflow */}
          <div className="absolute bottom-[110px] md:bottom-[83px] left-0 w-full flex justify-end px-6 sm:px-8 md:px-12 pointer-events-none select-none z-0">
            <h2 className="text-[13vw] sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-none text-white tracking-tighter" style={{ opacity: 0.6, marginRight: '-0.07em' }}>
              IAN LESTER
            </h2>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start mb-16 md:mb-20 gap-10">
            {/* COLUMN 1: HOOK & BUTTON (Anchored) */}
            <div className="flex flex-col justify-between h-full min-h-[160px] lg:w-1/3 w-full">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-accent" />
                  <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Let's Talk</span>
                </div>
                {/* Added break-words to prevent long words like COLLABORATE from breaking the padding on narrow screens */}
                <h3 className="text-2xl md:text-3xl font-black uppercase mb-3 leading-tight text-white break-words w-full">
                  {content?.hook_heading || "Want to elevate your visual identity? Let's collaborate."}
                </h3>
                <p className="text-[11px] max-w-sm leading-relaxed text-white/60">
                  {content?.hook_desc || "From brand systems to digital art — I bring ideas to life with precision and passion."}
                </p>
              </div>
              
              {/* BUTTON: Natural flow, no overlap */}
              <div className="pt-6">
                <button onClick={() => scrollToSection('contact')} className="btn-primary text-[10px] px-6 py-3 uppercase tracking-widest font-bold" style={{ background: 'var(--accent)', color: '#000000' }}>Book a Call</button>
              </div>
            </div>

            {/* COLUMN 2: NAVIGATION */}
            <div>
               <h4 className="text-[9px] uppercase tracking-widest mb-6 font-bold opacity-30 text-white">Navigation</h4>
               <ul className="space-y-4 text-[11px] text-white/80 font-bold uppercase">
                 {['Home', 'Services', 'Works', 'About'].map(item => (
                   <li key={item}><button onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-accent transition-colors">{item}</button></li>
                 ))}
               </ul>
            </div>

            {/* COLUMN 3: CONTACT */}
            <div>
               <h4 className="text-[9px] uppercase tracking-widest mb-6 font-bold opacity-30 text-white">Contact</h4>
               <ul className="space-y-4 text-[11px] text-white/80 font-bold">
                 <li className="flex items-center gap-3"><Mail size={12} className="text-accent" /> {content?.email || 'yhanlhester@gmail.com'}</li>
                 <li className="flex items-center gap-3"><Phone size={12} className="text-accent" /> {content?.phone || '+639524437988'}</li>
               </ul>
            </div>

            {/* COLUMN 4: CONNECT */}
            <div>
               <h4 className="text-[9px] uppercase tracking-widest mb-6 font-bold opacity-30 text-white">Connect</h4>
               <ul className="space-y-4 text-[11px] text-white/80 font-bold">
                  <li><a href={content?.instagram} target="_blank" className="hover:text-accent flex items-center gap-3 transition-colors"><Instagram size={12} /> Instagram</a></li>
                  <li><a href={content?.github} target="_blank" className="hover:text-accent flex items-center gap-3 transition-colors"><Github size={12} /> GitHub</a></li>
                  <li><a href={content?.facebook} target="_blank" className="hover:text-accent flex items-center gap-3 transition-colors"><Facebook size={12} /> Facebook</a></li>
               </ul>
            </div>
          </div>
            
          {/* FLARE LINE */}
          <div className="relative z-10 mt-2 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 text-[9px] uppercase tracking-widest font-bold text-white text-center md:text-left" style={{ borderColor: 'rgba(255, 255, 255, 0.6)', opacity: 0.6 }}>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <button onClick={() => { clickCountRef.current++; if(clickCountRef.current >= 5) onAdminTrigger(); }}>{`© ${new Date().getFullYear()} Ian Lester Eclevia. All rights reserved.`}</button>
              
              {/* PRIVACY AND TERMS LINKS ADDED HERE */}
              <div className="flex items-center justify-center gap-4">
                <a href="/privacy" className="hover:text-accent transition-colors">Privacy</a>
                <span className="opacity-30">|</span>
                <a href="/terms" className="hover:text-accent transition-colors">Terms</a>
              </div>
            </div>

            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-accent transition-colors mt-2 md:mt-0">Back to Top ↑</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
