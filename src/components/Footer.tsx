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
    <footer className="relative bg-transparent overflow-hidden mt-10 font-heading">
      <div className="section-container relative pb-12">
        <div 
          className="relative z-10 p-6 sm:p-8 md:p-12 rounded-[40px] border transition-all duration-500 backdrop-blur-[32px] flex flex-col"
          style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
        >
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start mb-16 gap-10">
            
            <div className="flex flex-col justify-between h-full min-h-[160px] lg:w-1/3 w-full">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-accent" />
                  <span className="uppercase tracking-widest font-bold" style={{ color: 'var(--accent)', fontSize: 'clamp(9px, 0.9vw, 12px)' }}>Let's Talk</span>
                </div>
                <h3 className="font-black uppercase mb-3 leading-tight break-words w-full" style={{ color: 'var(--text-primary)', fontSize: 'clamp(18px, 2vw, 28px)' }}>
                  {content?.hook_heading || "Want to elevate your visual identity? Let's collaborate."}
                </h3>
                <p className="max-w-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(10px, 1vw, 14px)' }}>
                  {content?.hook_desc || "From brand systems to digital art — I bring ideas to life with precision and passion."}
                </p>
              </div>
              
              <div className="pt-6">
                <button onClick={() => scrollToSection('contact')} className="btn-primary uppercase tracking-widest font-bold">
                  Book a Call
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 w-full lg:w-2/3 lg:justify-items-end">
              
              <div className="flex flex-col">
                 <h4 className="uppercase tracking-widest mb-6 font-bold" style={{ color: 'var(--text-primary)', opacity: 0.4, fontSize: 'clamp(8px, 0.8vw, 11px)' }}>Navigation</h4>
                 <ul className="space-y-4 font-bold uppercase" style={{ fontSize: 'clamp(10px, 1vw, 13px)' }}>
                   {['Home', 'Services', 'Works', 'About'].map(item => (
                     <li key={item}>
                       <button onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-accent transition-colors text-left" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>
                         {item}
                       </button>
                     </li>
                   ))}
                 </ul>
              </div>

              <div className="flex flex-col">
                 <h4 className="uppercase tracking-widest mb-6 font-bold" style={{ color: 'var(--text-primary)', opacity: 0.4, fontSize: 'clamp(8px, 0.8vw, 11px)' }}>Contact</h4>
                 <ul className="space-y-4 font-bold" style={{ fontSize: 'clamp(10px, 1vw, 13px)' }}>
                   <li>
                     <a href={`mailto:${content?.email || 'yhanlhester@gmail.com'}`} className="flex items-center gap-3 hover:text-accent transition-colors" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>
                       <Mail size={12} className="text-accent shrink-0" /> <span className="break-all">{content?.email || 'yhanlhester@gmail.com'}</span>
                     </a>
                   </li>
                   <li>
                     <a href={`tel:${content?.phone || '+639524437988'}`} className="flex items-center gap-3 hover:text-accent transition-colors" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>
                       <Phone size={12} className="text-accent shrink-0" /> <span>{content?.phone || '+639524437988'}</span>
                     </a>
                   </li>
                 </ul>
              </div>

              <div className="flex flex-col col-span-2 md:col-span-1">
                 <h4 className="uppercase tracking-widest mb-6 font-bold" style={{ color: 'var(--text-primary)', opacity: 0.4, fontSize: 'clamp(8px, 0.8vw, 11px)' }}>Connect</h4>
                 <ul className="space-y-4 font-bold" style={{ fontSize: 'clamp(10px, 1vw, 13px)' }}>
                   <li><a href={content?.instagram} target="_blank" className="hover:text-accent flex items-center gap-3 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.7 }}><Instagram size={12} className="text-accent" /> Instagram</a></li>
                   <li><a href={content?.github} target="_blank" className="hover:text-accent flex items-center gap-3 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.7 }}><Github size={12} className="text-accent" /> GitHub</a></li>
                   <li><a href={content?.facebook} target="_blank" className="hover:text-accent flex items-center gap-3 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.7 }}><Facebook size={12} className="text-accent" /> Facebook</a></li>
                 </ul>
              </div>

            </div>
          </div>
            
          <div className="relative z-0 w-full flex justify-end mt-4 mb-4 md:mt-0 pointer-events-none select-none overflow-hidden">
            <h2 className="text-[11vw] sm:text-[9vw] md:text-[6vw] lg:text-[4.5vw] font-black uppercase leading-[0.8] tracking-tighter" style={{ color: 'var(--text-primary)', opacity: 0.08 }}>
              IAN LESTER
            </h2>
          </div>

          <div 
            className="relative z-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 uppercase tracking-widest font-bold text-center md:text-left"
            style={{ borderColor: 'var(--glass-border)', fontSize: 'clamp(8px, 0.8vw, 11px)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>
              <button 
                onClick={() => { 
                  clickCountRef.current++; 
                  if(clickCountRef.current >= 5) onAdminTrigger(); 
                }} 
                className="hover:text-accent transition-colors"
              >
                {`© ${new Date().getFullYear()} Ian Lester Eclevia. All rights reserved.`}
              </button>
              
              <div className="flex items-center justify-center gap-4">
                <a href="/privacy" className="hover:text-accent transition-colors">Privacy</a>
                <span style={{ color: 'var(--text-primary)', opacity: 0.2 }}>|</span>
                <a href="/terms" className="hover:text-accent transition-colors">Terms</a>
              </div>
            </div>

            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-accent transition-colors mt-2 md:mt-0" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>
              Back to Top ↑
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
