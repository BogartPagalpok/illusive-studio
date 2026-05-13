import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Works', href: '#works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Navbar() {
  // Batch state to prevent multiple render cycles per scroll event
  const [navState, setNavState] = useState({ scrolled: false, visible: true });
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const current = window.scrollY;
      const shouldBeScrolled = current > 50;
      // Auto-hide: Hide if scrolling down > 150px, show if scrolling up
      const isScrollingDown = current > lastScrollY.current && current > 150;
      const shouldBeVisible = !isScrollingDown || current < 20;

      // Crucial: Only update state if values actually change
      setNavState(prev => {
        if (prev.scrolled === shouldBeScrolled && prev.visible === shouldBeVisible) {
          return prev;
        }
        return { scrolled: shouldBeScrolled, visible: shouldBeVisible };
      });

      lastScrollY.current = current;
    };

    const checkModal = () => {
      const modalActive = document.body.style.overflow === 'hidden';
      setIsModalOpen(prev => (prev !== modalActive ? modalActive : prev));
    };

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    const fetchContent = async () => {
      try {
        const { data } = await supabase.from('site_content').select('key, value').eq('section', 'navbar');
        if (data) {
          const mapped = { logo_text: 'IAN.LESTER', cta_text: 'Hire Me' };
          data.forEach(row => {
            if (row.key === 'logo_text') mapped.logo_text = row.value;
            if (row.key === 'cta_text') mapped.cta_text = row.value;
          });
          setContent(mapped);
        }
      } catch (err) {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    fetchContent();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToId(href.replace('#', ''));
    setMobileOpen(false);
  };

  // The "Taskbar" trigger logic
  const showNav = (navState.visible || isHovered || mobileOpen) && !isModalOpen;

  return (
    <>
      {/* PEEK ZONE */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-[60]" 
        onMouseEnter={() => setIsHovered(true)} 
      />

      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          navState.scrolled || mobileOpen ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
        } ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative font-heading font-black text-xl tracking-wider uppercase transition-colors text-white"
          >
            {content.logo_text.includes('.') ? (
              <>
                {content.logo_text.split('.')[0]}<span className="text-accent group-hover:animate-pulse">.</span>{content.logo_text.split('.')[1]}
              </>
            ) : content.logo_text}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="group relative text-[10px] font-heading font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-all"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="btn-primary text-[10px] py-3 px-8 font-black uppercase">
              {content.cta_text}
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 bg-black/95 ${mobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'}`}>
          <div className="flex flex-col p-10 gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-2xl font-heading font-black uppercase text-white hover:text-accent">
                {link.label}
              </a>
            ))}
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="btn-primary text-sm py-4 px-6 text-center font-black">
              {content.cta_text}
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
