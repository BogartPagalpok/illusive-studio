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
  // Batched state for scrolled & visible to minimize render cycles
  const [navState, setNavState] = useState({ scrolled: false, visible: true });
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Optimized Scroll Logic with strict State Bailing
    const handleScroll = () => {
      const current = window.scrollY;
      const shouldBeScrolled = current > 50;
      
      // Taskbar: Only hide if scrolling down significantly (>150px)
      // Always show if scrolling up OR near top (< 20px)
      const isScrollingDown = current > lastScrollY.current && current > 150;
      const shouldBeVisible = !isScrollingDown || current < 20;

      setNavState(prev => 
        (prev.scrolled === shouldBeScrolled && prev.visible === shouldBeVisible) 
          ? prev 
          : { scrolled: shouldBeScrolled, visible: shouldBeVisible }
      );
      
      lastScrollY.current = current;
    };

    // 2. High-performance observer for body-lock (Works Modals)
    const observer = new MutationObserver(() => {
      const modalActive = document.body.style.overflow === 'hidden';
      setIsModalOpen(prev => (prev !== modalActive ? modalActive : prev));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    // 3. Supabase Fetch
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
      } catch (err) {
        console.error("Nav data fetch failed");
      }
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

  // Final Visibility: Show if (Direction is Up OR Mouse is Peeking OR Mobile Menu) AND (No Modal)
  const isActuallyVisible = (navState.visible || isHovered || mobileOpen) && !isModalOpen;

  return (
    <>
      {/* PEEK TRIGGER: Invisible zone at the very top of screen */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-[110]" 
        onMouseEnter={() => setIsHovered(true)} 
      />

      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          navState.scrolled || mobileOpen ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
        } ${isActuallyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
          {/* LOGO */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative font-heading font-black text-xl tracking-wider uppercase transition-colors text-white"
          >
            {content.logo_text.includes('.') ? (
              <>
                {content.logo_text.split('.')[0]}<span className="text-accent group-hover:animate-pulse">.</span>{content.logo_text.split('.')[1]}
              </>
            ) : content.logo_text}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full shadow-[0_0_8px_var(--accent)]" />
          </button>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="group relative px-1 py-2 text-[10px] font-heading font-bold tracking-[0.2em] uppercase transition-all duration-300 text-white"
              >
                <span className="opacity-60 group-hover:opacity-100 group-hover:text-accent transition-all duration-300">
                  {link.label}
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300 shadow-[0_0_10px_var(--accent)]" />
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="bg-accent text-black px-7 py-3 rounded-md text-[10px] font-black uppercase hover:scale-105 hover:bg-white transition-all shadow-xl"
            >
              {content.cta_text}
            </a>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white hover:text-accent transition-colors"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MOBILE MENU & GET IN TOUCH */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 bg-black/98 backdrop-blur-xl ${mobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'}`}>
          <div className="flex flex-col p-10 gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="group relative inline-block text-2xl font-heading font-black tracking-widest uppercase text-white hover:text-accent transition-all duration-300"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-accent opacity-0 group-hover:opacity-100 group-hover:w-16 transition-all duration-300" />
              </a>
            ))}
            <div className="pt-6 border-t border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 italic">Get In Touch</p>
              <p className="text-white/50 text-sm font-heading">hello@illusive.studio</p>
            </div>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="bg-accent text-black py-4 px-6 rounded-md text-center font-black uppercase shadow-lg"
            >
              {content.cta_text}
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
