import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, Instagram, Github, Facebook, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Footer({ onAdminTrigger }: { onAdminTrigger: () => void }) {
  const [content, setContent] = useState<any>(null);
  const clickCountRef = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('site_content').select('key, value').eq('section', 'footer').eq('visible', true);
      if (data) {
        const mapped = data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
        setContent(mapped);
      }
    };
    fetchContent();
  }, []);

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="relative bg-transparent overflow-hidden mt-6 font-heading">
      <div className="section-container relative pb-8">
        <div 
          className="relative z-10 p-6 sm:p-8 md:p-10 rounded-[28px] border transition-all duration-500 backdrop-blur-[32px] flex flex-col"
          style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
        >
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start mb-8 gap-8">
            
            <div className="flex flex-col justify-between h-full min-h-[120px] lg:w-2/5 w-full">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-accent" />
                  <span className="uppercase tracking-[0.2em] font-bold text-xs" style={{ color: 'var(--accent)' }}>Let's Talk</span>
                </div>
                <h3 className="font-black uppercase mb-3 leading-tight break-words w-full" style={{ color: 'var(--text-primary)', fontSize: 'clamp(18px, 2.2vw, 28px)' }}>
                  {content?.hook_heading || "Want to elevate your visual identity? Let's collaborate."}
                </h3>
                <p className="max-w-md leading-relaxed font-light" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px, 1vw, 15px)' }}>
                  {content?.hook_desc || "From brand systems to digital art — I bring ideas to life with precision and passion."}
                </p>
              </div>
              
              <div className="pt-6">
                <button onClick={() => scrollToSection('contact')} className="btn-primary uppercase tracking-widest font-bold">
                  Book a Call
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 sm:gap-8 w-full lg:w-3/5 lg:justify-items-end">
              
              <div className="flex flex-col">
                 <h4 className="uppercase tracking-[0.25em] mb-4 font-black text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Navigation</h4>
                 <ul className="space-y-2.5 font-semibold uppercase" style={{ fontSize: 'clamp(13px, 0.95vw, 14px)' }}>
                   {['Home', 'Services', 'Works', 'About'].map(item => (
                     <li key={item}>
                       <button onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-accent transition-colors text-left" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>
                         {item}
                       </button>
                     </li>
                   ))}
                 </ul>
              </div>

              <div className="flex flex-col">
                 <h4 className="uppercase tracking-[0.25em] mb-4 font-black text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Contact</h4>
                 <ul className="space-y-2.5 font-medium" style={{ fontSize: 'clamp(13px, 0.95vw, 14px)' }}>
                   <li>
                     <a href={`mailto:${content?.email || 'yhanlhester@gmail.com'}`} className="flex items-center gap-2.5 hover:text-accent transition-colors" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>
                       <Mail size={15} className="text-accent shrink-0" /> <span className="break-all">{content?.email || 'yhanlhester@gmail.com'}</span>
                     </a>
                   </li>
                   <li>
                     <a href={`tel:${content?.phone || '+639524437988'}`} className="flex items-center gap-2.5 hover:text-accent transition-colors" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>
                       <Phone size={15} className="text-accent shrink-0" /> <span>{content?.phone || '+639524437988'}</span>
                     </a>
                   </li>
                 </ul>
              </div>

              <div className="flex flex-col">
                 <h4 className="uppercase tracking-[0.25em] mb-4 font-black text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Connect</h4>
                 <ul className="space-y-2.5 font-semibold" style={{ fontSize: 'clamp(13px, 0.95vw, 14px)' }}>
                   <li><a href={content?.instagram} target="_blank" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.85 }}><Instagram size={15} className="text-accent shrink-0" /> Instagram</a></li>
                   <li><a href={content?.github} target="_blank" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.85 }}><Github size={15} className="text-accent shrink-0" /> GitHub</a></li>
                   <li><a href={content?.facebook} target="_blank" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.85 }}><Facebook size={15} className="text-accent shrink-0" /> Facebook</a></li>
                 </ul>
              </div>

            </div>
          </div>
            
          <div className="relative z-0 w-full flex justify-end mt-2 mb-2 md:mt-0 pointer-events-none select-none overflow-hidden">
            <h2 className="text-[10vw] sm:text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-black uppercase leading-[0.8] tracking-tighter" style={{ color: 'var(--text-primary)', opacity: 0.06 }}>
              IAN LESTER
            </h2>
          </div>

          <div 
            className="relative z-10 pt-5 border-t flex flex-col md:flex-row justify-between items-center gap-4 md:gap-3 uppercase tracking-wider font-semibold text-center md:text-left"
            style={{ borderColor: 'var(--glass-border)', fontSize: 'clamp(11px, 0.85vw, 13px)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>
              <button 
                onClick={() => { 
                  clickCountRef.current++; 
                  if(clickCountRef.current >= 5) onAdminTrigger(); 
                }} 
                className="hover:text-accent transition-colors cursor-default"
              >
                {`© ${new Date().getFullYear()} Ian Lester Eclevia. All rights reserved.`}
              </button>
              
              <div className="flex items-center justify-center gap-3">
                <a href="/privacy" className="hover:text-accent transition-colors">Privacy</a>
                <span style={{ color: 'var(--text-primary)', opacity: 0.3 }}>|</span>
                <a href="/terms" className="hover:text-accent transition-colors">Terms</a>
              </div>
            </div>

            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-accent transition-colors mt-1 md:mt-0 font-bold" style={{ color: 'var(--text-primary)', opacity: 0.65 }} aria-label="Scroll back to top of page">
              Back to Top ↑
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
