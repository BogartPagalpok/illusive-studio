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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // 1. ADVANCED AUTO-HIDE LOGIC (GSAP POWERED)
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);

      if (current > lastScrollY.current && current > 120 && !isHidden.current) {
        // Scrolling Down - Hide
        gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'power2.inOut' });
        isHidden.current = true;
      } else if (current < lastScrollY.current && isHidden.current) {
        // Scrolling Up - Show
        gsap.to(nav, { yPercent: 0, duration: 0.4, ease: 'power2.out' });
        isHidden.current = false;
      }
      lastScrollY.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 2. MODAL DETECTION
    const observer = new MutationObserver(() => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    // 3. DATABASE CONTENT
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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (href: string) => {
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      {/* TRIGGER ZONE: Brings nav back when hovering at the very top */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-[998]"
        onMouseEnter={() => {
          gsap.to(navRef.current, { yPercent: 0, duration: 0.3 });
          isHidden.current = false;
        }}
      />

      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[999] transition-colors duration-500 ${
          scrolled ? 'backdrop-blur-md bg-black/80 shadow-2xl' : 'bg-transparent'
        } ${isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
          
          {/* LOGO */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative font-black text-xl tracking-tighter uppercase text-white"
          >
            {content.logo_text}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full shadow-[0_0_10px_var(--accent)]" />
          </button>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="group relative py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/70 hover:text-white transition-all"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-300" />
              </button>
            ))}
            <button 
              onClick={() => handleNavClick('#contact')}
              className="bg-accent text-white text-[10px] py-3 px-8 font-black uppercase tracking-widest rounded-sm hover:scale-105 transition-transform"
            >
              {content.cta_text}
            </button>
          </div>

          {/* MOBILE TOGGLE (RAW SVG TO PREVENT BUILD FAIL) */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 bg-black/95 backdrop-blur-2xl ${mobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'}`}>
          <div className="p-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <button 
                key={link.href} 
                onClick={() => handleNavClick(link.href)} 
                className="text-white text-3xl font-black uppercase text-left tracking-tighter"
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
