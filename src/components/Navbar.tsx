import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Works', href: '#works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);

      // Strict Auto-Hide: Hide on scroll down, show on scroll up
      if (current > lastScrollY.current && current > 100) {
        setVisible(false);
      } else if (current < lastScrollY.current || current < 20) {
        setVisible(true);
      }
      lastScrollY.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Modal detection to prevent navbar from appearing over work modals
    const observer = new MutationObserver(() => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

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

  // Only show if visible by scroll OR hovered at the very top
  const showNav = (visible || isHovered || mobileOpen) && !isModalOpen;

  return (
    <>
      {/* TRIGGER ZONE: Exact navbar height (h-20) */}
      <div
        className="fixed top-0 left-0 right-0 h-20 z-[998] bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ease-in-out ${
          scrolled ? 'backdrop-blur-md bg-black/90' : 'bg-transparent'
        } ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="font-black text-xl uppercase text-white tracking-tighter"
          >
            {content.logo_text}
          </button>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.href} 
                onClick={() => handleNavClick(link.href)} 
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-accent transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button 
              onClick={() => handleNavClick('#contact')} 
              className="btn-primary text-[10px] py-2.5 px-6 font-black uppercase tracking-widest"
            >
              {content.cta_text}
            </button>
          </div>

          {/* MOBILE TOGGLE (No Icon Library Dependency) */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden text-white font-bold text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 rounded"
          >
            {mobileOpen ? 'CLOSE' : 'MENU'}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/10 p-8 flex flex-col gap-6">
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
        )}
      </nav>
    </>
  );
}
