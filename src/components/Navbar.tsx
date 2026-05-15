import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Works', href: '#works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => {
      const current = window.scrollY;
      
      // Background blur transition
      if (current > 50 && !scrolled) setScrolled(true);
      if (current <= 50 && scrolled) setScrolled(false);

      // AUTO-HIDE / REVEAL LOGIC
      if (current > lastScrollY.current && current > 120) {
        // SCROLLING DOWN: Smooth slide out
        if (!isHidden.current) {
          gsap.to(nav, { 
            yPercent: -100, 
            duration: 0.5, 
            ease: "expo.inOut",
            opacity: 0 
          });
          isHidden.current = true;
        }
      } else if (current < lastScrollY.current) {
        // SCROLLING UP: Snappy reveal
        if (isHidden.current) {
          gsap.to(nav, { 
            yPercent: 0, 
            duration: 0.6, 
            ease: "expo.out",
            opacity: 1 
          });
          isHidden.current = false;
        }
      }
      
      lastScrollY.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    async function fetchNav() {
      const { data } = await supabase.from('site_content').select('key, value').eq('section', 'navbar');
      if (data) {
        const mapped = { logo_text: 'IAN.LESTER', cta_text: 'Hire Me' };
        data.forEach(row => {
          if (row.key === 'logo_text') mapped.logo_text = row.value;
          if (row.key === 'cta_text') mapped.cta_text = row.value;
        });
        setContent(mapped);
      }
    }

    fetchNav();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleNavClick = (href: string) => {
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      {/* HOVER SENSOR ZONE */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-[998]"
        onMouseEnter={() => {
          gsap.to(navRef.current, { yPercent: 0, opacity: 1, duration: 0.4, ease: "expo.out" });
          isHidden.current = false;
        }}
      />

      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[999] will-change-transform ${
          scrolled ? 'backdrop-blur-xl bg-black/40 border-b border-white/5' : 'bg-transparent'
        }`}
        style={{ opacity: 1, transform: 'translateY(0%)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-black text-2xl uppercase text-white tracking-tighter"
          >
            {content.logo_text}
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="group relative text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-300" />
              </button>
            ))}
            <button 
              onClick={() => handleNavClick('#contact')}
              className="bg-white text-black text-[11px] py-3 px-8 font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
            >
              {content.cta_text}
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d={mobileOpen ? "M18 6L6 18M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"}/>
            </svg>
          </button>
        </div>

        {/* MOBILE MENU */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 bg-black ${mobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'}`}>
          <div className="p-10 flex flex-col gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.href} 
                onClick={() => handleNavClick(link.href)} 
                className="text-white text-4xl font-black uppercase text-left tracking-tighter"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
