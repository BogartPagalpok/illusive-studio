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
        {/* 3D Floating Parent Wrapper */}
        <div className="relative z-10 w-full flex justify-center" style={{ perspective: '1000px' }}>
          <div
            className="parent relative w-full transition-all duration-500"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* The Card */}
            <div
              className="card relative w-full rounded-[50px] p-4 sm:p-5 md:p-8 transition-all duration-500"
              style={{
                transformStyle: 'preserve-3d',
                background: `linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent), #000 40%) 100%)`,
                boxShadow: 'rgba(37,5,71,0) 40px 50px 25px -40px, rgba(34,5,71,0.2) 0px 25px 25px -5px',
              }}
            >
              {/* Glass overlay */}
              <div
                className="absolute rounded-[55px]"
                style={{
                  inset: '8px',
                  borderTopRightRadius: '100%',
                  background: 'linear-gradient(0deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 100%)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  transform: 'translate3d(0px, 0px, 25px)',
                  borderLeft: '1px solid rgba(255,255,255,0.15)',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  pointerEvents: 'none',
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-6" style={{ transform: 'translate3d(0, 0, 26px)' }}>
                
                {/* Top Row: Let's Talk + Nav/Contact/Connect */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  
                  {/* Let's Talk */}
                  <div className="flex flex-col justify-between min-h-[100px] lg:w-1/3 w-full">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles size={12} style={{ color: '#fff' }} />
                        <span className="uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(8px, 0.8vw, 10px)' }}>Let's Talk</span>
                      </div>
                      <h3 className="font-black uppercase mb-2 leading-tight break-words w-full" style={{ color: '#fff', fontSize: 'clamp(15px, 1.6vw, 22px)' }}>
                        {content?.hook_heading || "Want to elevate your visual identity? Let's collaborate."}
                      </h3>
                      <p className="max-w-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(9px, 0.85vw, 12px)' }}>
                        {content?.hook_desc || "From brand systems to digital art — I bring ideas to life with precision and passion."}
                      </p>
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={() => scrollToSection('contact')}
                        className="uppercase tracking-widest font-bold rounded-full px-6 py-2 transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.3)',
                          fontSize: 'clamp(8px, 0.8vw, 10px)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                          e.currentTarget.style.color = '#fff';
                        }}
                      >
                        Book a Call
                      </button>
                    </div>
                  </div>

                  {/* Nav / Contact / Connect */}
                  <div className="grid grid-cols-3 gap-6 w-full lg:w-2/3 lg:justify-items-end">
                    <div className="flex flex-col">
                      <h4 className="uppercase tracking-widest mb-3 font-bold" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(7px, 0.7vw, 9px)' }}>Navigation</h4>
                      <ul className="space-y-2 font-bold uppercase" style={{ fontSize: 'clamp(9px, 0.85vw, 11px)' }}>
                        {['Home', 'Services', 'Works', 'About'].map(item => (
                          <li key={item}>
                            <button onClick={() => scrollToSection(item.toLowerCase())} className="transition-colors text-left" style={{ color: 'rgba(255,255,255,0.8)' }}>
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col">
                      <h4 className="uppercase tracking-widest mb-3 font-bold" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(7px, 0.7vw, 9px)' }}>Contact</h4>
                      <ul className="space-y-2 font-bold" style={{ fontSize: 'clamp(9px, 0.85vw, 11px)' }}>
                        <li>
                          <a href={`mailto:${content?.email || 'yhanlhester@gmail.com'}`} className="flex items-center gap-2 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}>
                            <Mail size={10} style={{ color: '#fff' }} /> <span className="break-all">{content?.email || 'yhanlhester@gmail.com'}</span>
                          </a>
                        </li>
                        <li>
                          <a href={`tel:${content?.phone || '+639524437988'}`} className="flex items-center gap-2 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}>
                            <Phone size={10} style={{ color: '#fff' }} /> <span>{content?.phone || '+639524437988'}</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col">
                      <h4 className="uppercase tracking-widest mb-3 font-bold" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(7px, 0.7vw, 9px)' }}>Connect</h4>
                      <ul className="space-y-2 font-bold" style={{ fontSize: 'clamp(9px, 0.85vw, 11px)' }}>
                        <li><a href={content?.instagram} target="_blank" className="flex items-center gap-2 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}><Instagram size={10} style={{ color: '#fff' }} /> Instagram</a></li>
                        <li><a href={content?.github} target="_blank" className="flex items-center gap-2 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}><Github size={10} style={{ color: '#fff' }} /> GitHub</a></li>
                        <li><a href={content?.facebook} target="_blank" className="flex items-center gap-2 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}><Facebook size={10} style={{ color: '#fff' }} /> Facebook</a></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* IAN LESTER Watermark */}
                <div className="flex justify-end">
                  <span
                    className="font-black uppercase leading-[0.8] tracking-tighter"
                    style={{
                      color: '#fff',
                      fontSize: 'clamp(2rem, 5vw, 4rem)',
                      opacity: 0.15,
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    IAN LESTER
                  </span>
                </div>

                {/* Bottom Bar: Copyright + Terms + Back to Top */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t uppercase tracking-widest font-bold text-center md:text-left" style={{ borderColor: 'rgba(255,255,255,0.15)', fontSize: 'clamp(7px, 0.7vw, 9px)' }}>
                  <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <button onClick={() => { clickCountRef.current++; if(clickCountRef.current >= 5) onAdminTrigger(); }} className="transition-colors hover:text-white">
                      {`© ${new Date().getFullYear()} Ian Lester Eclevia. All rights reserved.`}
                    </button>
                    <div className="flex items-center justify-center gap-3">
                      <a href="/privacy" className="transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }}>Privacy</a>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                      <a href="/terms" className="transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }}>Terms</a>
                    </div>
                  </div>
                  <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="transition-colors hover:text-white mt-1 md:mt-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Back to Top ↑
                  </button>
                </div>

              </div>

              {/* Decorative Circles */}
              {[
                { size: '120px', top: '6px', right: '6px', z: 20 },
                { size: '90px', top: '12px', right: '12px', z: 40 },
                { size: '60px', top: '18px', right: '18px', z: 60 },
                { size: '35px', top: '22px', right: '22px', z: 80 },
              ].map((circle, i) => (
                <div
                  key={i}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: circle.size,
                    height: circle.size,
                    top: circle.top,
                    right: circle.right,
                    transform: `translate3d(0, 0, ${circle.z}px)`,
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    boxShadow: 'rgba(100,100,111,0.2) -10px 10px 20px 0px',
                    transition: `all 0.5s ease-in-out ${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
