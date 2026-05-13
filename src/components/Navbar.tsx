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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  useEffect(() => {
    // 1. Scroll tracking for background transition
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 2. High-performance Modal Detection (Replaces polling)
    const checkModal = () => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    };

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    // 3. Dynamic content fetch
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'navbar');

        if (!error && data && data.length > 0) {
          const mapped = { logo_text: 'IAN.LESTER', cta_text: 'Hire Me' };
          data.forEach(row => {
            if (row.key === 'logo_text') mapped.logo_text = row.value;
            if (row.key === 'cta_text') mapped.cta_text = row.value;
          });
          setContent(mapped);
        }
      } catch (err) {
        console.error("Content fetch failed, using defaults.");
      }
    };

    fetchContent();
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToId(href.replace('#', ''));
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'backdrop-blur-md shadow-lg bg-[var(--bg-primary)]/95' : 'bg-transparent'
      } ${isModalOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'}`}
    >
      <div className="section-container flex items-center justify-between h-20 px-6 md:px-16">
        
        {/* LOGO WITH PULSE & UNDERLINE */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group relative font-heading font-black text-xl tracking-wider uppercase transition-colors text-[var(--text-primary)]"
        >
          {content.logo_text.includes('.') ? (
            <>
              {content.logo_text.split('.')[0]}<span className="text-accent group-hover:animate-pulse">.</span>{content.logo_text.split('.')[1]}
            </>
          ) : content.logo_text}
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full shadow-[0_0_8px_var(--accent)]" />
        </button>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="group relative px-1 py-2 text-[10px] font-heading font-bold tracking-[0.2em] uppercase transition-all duration-300 text-[var(--text-primary)]"
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
            className="btn-primary text-[10px] py-3 px-8 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_var(--accent)] font-black"
          >
            {content.cta_text}
          </a>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 hover:text-accent transition-colors duration-300 text-[var(--text-primary)]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 bg-[var(--bg-primary)]/98 backdrop-blur-xl ${mobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'}`}>
        <div className="section-container py-10 flex flex-col gap-8 px-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="group relative inline-block text-2xl font-heading font-black tracking-widest uppercase transition-all duration-300 text-[var(--text-primary)]"
            >
              <span className="opacity-60 group-hover:opacity-100 group-hover:text-accent transition-all duration-300">
                {link.label}
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-accent opacity-0 group-hover:opacity-100 group-hover:w-12 transition-all duration-300" />
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="btn-primary text-sm py-4 px-6 justify-center mt-6 font-black"
          >
            {content.cta_text}
          </a>
        </div>
      </div>
    </nav>
  );
}
