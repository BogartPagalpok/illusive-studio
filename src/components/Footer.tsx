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
    <footer className="relative bg-transparent overflow-hidden mt-6 font-heading">
      <div className="section-container relative pb-8">
        <div 
          className="relative z-10 p-4 sm:p-5 md:p-6 rounded-[28px] border transition-all duration-500 backdrop-blur-[32px] flex flex-col"
          style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
        >
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
            
            <div className="flex flex-col justify-between h-full min-h-[100px] lg:w-1/3 w-full">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} className="text-accent" />
                  <span className="uppercase tracking-widest font-bold" style={{ color: 'var(--accent)', fontSize: 'clamp(8px, 0.8vw, 10px)' }}>Let's Talk</span>
                </div>
                <h3 className="font-black uppercase mb-2 leading-tight break-words w-full" style={{ color: 'var(--text-primary)', fontSize: 'clamp(15px, 1.6vw, 22px)' }}>
                  {content?.hook_heading || "Want to elevate your visual identity? Let's collaborate."}
                </h3>
                <p className="max-w-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(9px, 0.85vw, 12px)' }}>
                  {content?.hook_desc || "From brand systems to digital art — I bring ideas to life with precision and passion."}
                </p>
              </div>
              
              <div className="pt-4">
                <button onClick={() => scrollToSection('contact')} className="btn-primary uppercase tracking-widest font-bold">
                  Book a Call
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full lg:w-2/3 lg:justify-items-end">
              
              <div className="flex flex-col">
                 <h4 className="uppercase tracking-widest mb-3 font-bold" style={{ color: 'var(--text-primary)', opacity: 0.4, fontSize: 'clamp(7px, 0.7vw, 9px)' }}>Navigation</h4>
                 <ul className="space-y-2 font-bold uppercase" style={{ fontSize: 'clamp(9px, 0.85vw, 11px)' }}>
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
                 <h4 className="uppercase tracking-widest mb-3 font-bold" style={{ color: 'var(--text-primary)', opacity: 0.4, fontSize: 'clamp(7px, 0.7vw, 9px)' }}>Contact</h4>
                 <ul className="space-y-2 font-bold" style={{ fontSize: 'clamp(9px, 0.85vw, 11px)' }}>
                   <li>
                     <a href={`mailto:${content?.email || 'yhanlhester@gmail.com'}`} className="flex items-center gap-2 hover:text-accent transition-colors" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>
                       <Mail size={10} className="text-accent shrink-0" /> <span className="break-all">{content?.email || 'yhanlhester@gmail.com'}</span>
                     </a>
                   </li>
                   <li>
                     <a href={`tel:${content?.phone || '+639524437988'}`} className="flex items-center gap-2 hover:text-accent transition-colors" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>
                       <Phone size={10} className="text-accent shrink-0" /> <span>{content?.phone || '+639524437988'}</span>
                     </a>
                   </li>
                 </ul>
              </div>

              <div className="flex flex-col">
                 <h4 className="uppercase tracking-widest mb-3 font-bold" style={{ color: 'var(--text-primary)', opacity: 0.4, fontSize: 'clamp(7px, 0.7vw, 9px)' }}>Connect</h4>
                 <ul className="space-y-2 font-bold" style={{ fontSize: 'clamp(9px, 0.85vw, 11px)' }}>
                   <li><a href={content?.instagram} target="_blank" className="hover:text-accent flex items-center gap-2 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.7 }}><Instagram size={10} className="text-accent" /> Instagram</a></li>
                   <li><a href={content?.github} target="_blank" className="hover:text-accent flex items-center gap-2 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.7 }}><Github size={10} className="text-accent" /> GitHub</a></li>
                   <li><a href={content?.facebook} target="_blank" className="hover:text-accent flex items-center gap-2 transition-colors w-fit" style={{ color: 'var(--text-primary)', opacity: 0.7 }}><Facebook size={10} className="text-accent" /> Facebook</a></li>
                 </ul>
              </div>

            </div>
          </div>
            
          {/* 3D Floating Watermark Card */}
          <div className="relative z-0 w-full flex justify-center mt-4 mb-6 select-none" style={{ perspective: '1000px' }}>
            <div
              className="parent relative"
              style={{
                width: 'clamp(260px, 40vw, 400px)',
                height: 'clamp(180px, 25vw, 280px)',
              }}
            >
              {/* 3D Card */}
              <div
                className="card absolute inset-0 rounded-[50px] transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  background: `linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent), #000 40%) 100%)`,
                  boxShadow: 'rgba(37,5,71,0) 40px 50px 25px -40px, rgba(34,5,71,0.2) 0px 25px 25px -5px',
                }}
              >
                {/* Glass layer */}
                <div
                  className="glass absolute rounded-[55px]"
                  style={{
                    inset: '8px',
                    borderTopRightRadius: '100%',
                    background: 'linear-gradient(0deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.12) 100%)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    transform: 'translate3d(0px, 0px, 25px)',
                    borderLeft: '1px solid rgba(255,255,255,0.2)',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                  }}
                />

                {/* Content — IAN LESTER */}
                <div
                  className="content absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    transform: 'translate3d(0, 0, 26px)',
                    padding: '20px',
                  }}
                >
                  <span
                    className="font-black uppercase leading-[0.8] tracking-tighter text-center"
                    style={{
                      color: '#fff',
                      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    IAN<br />LESTER
                  </span>
                </div>

                {/* Social buttons at the bottom */}
                <div
                  className="bottom absolute left-4 right-4 flex items-center justify-center gap-3"
                  style={{
                    bottom: '16px',
                    transform: 'translate3d(0, 0, 26px)',
                    zIndex: 10,
                  }}
                >
                  <a
                    href={content?.instagram || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
                    style={{
                      width: '28px',
                      height: '28px',
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: 'rgba(28,5,71,0.5) 0px 7px 5px -5px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) translate3d(0,0,40px)';
                      e.currentTarget.style.background = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translate3d(0,0,0)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                    }}
                  >
                    <Instagram size={14} style={{ color: '#3f5efb' }} />
                  </a>
                  <a
                    href={content?.github || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
                    style={{
                      width: '28px',
                      height: '28px',
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: 'rgba(28,5,71,0.5) 0px 7px 5px -5px',
                      transitionDelay: '0.05s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) translate3d(0,0,40px)';
                      e.currentTarget.style.background = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translate3d(0,0,0)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                    }}
                  >
                    <Github size={14} style={{ color: '#3f5efb' }} />
                  </a>
                  <a
                    href={content?.facebook || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
                    style={{
                      width: '28px',
                      height: '28px',
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: 'rgba(28,5,71,0.5) 0px 7px 5px -5px',
                      transitionDelay: '0.1s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) translate3d(0,0,40px)';
                      e.currentTarget.style.background = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translate3d(0,0,0)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                    }}
                  >
                    <Facebook size={14} style={{ color: '#3f5efb' }} />
                  </a>
                </div>

                {/* Decorative circles */}
                {[
                  { size: '140px', top: '6px', right: '6px', z: 20, delay: 0 },
                  { size: '110px', top: '12px', right: '12px', z: 40, delay: 0.1 },
                  { size: '80px', top: '18px', right: '18px', z: 60, delay: 0.2 },
                  { size: '50px', top: '24px', right: '24px', z: 80, delay: 0.3 },
                ].map((circle, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: circle.size,
                      height: circle.size,
                      top: circle.top,
                      right: circle.right,
                      transform: `translate3d(0, 0, ${circle.z}px)`,
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)',
                      boxShadow: 'rgba(100,100,111,0.2) -10px 10px 20px 0px',
                      transition: `all 0.5s ease-in-out`,
                      transitionDelay: `${circle.delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div 
            className="relative z-10 pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-4 md:gap-3 uppercase tracking-widest font-bold text-center md:text-left"
            style={{ borderColor: 'var(--glass-border)', fontSize: 'clamp(7px, 0.7vw, 9px)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>
              <button 
                onClick={() => { 
                  clickCountRef.current++; 
                  if(clickCountRef.current >= 5) onAdminTrigger(); 
                }} 
                className="hover:text-accent transition-colors"
              >
                {`© ${new Date().getFullYear()} Ian Lester Eclevia. All rights reserved.`}
              </button>
              
              <div className="flex items-center justify-center gap-3">
                <a href="/privacy" className="hover:text-accent transition-colors">Privacy</a>
                <span style={{ color: 'var(--text-primary)', opacity: 0.2 }}>|</span>
                <a href="/terms" className="hover:text-accent transition-colors">Terms</a>
              </div>
            </div>

            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-accent transition-colors mt-1 md:mt-0" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>
              Back to Top ↑
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
