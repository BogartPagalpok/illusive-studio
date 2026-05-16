import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Works', href: '#works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const [theme, setTheme] = useState<'void' | 'light'>('void');

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme') || 'void';
    const valid = saved === 'light' ? 'light' : 'void';
    setTheme(valid);
    document.documentElement.setAttribute('data-theme', valid);
    document.body.setAttribute('data-theme', valid);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);
      if (current > 0 && !hasScrolledDown) setHasScrolledDown(true);
      if (mobileOpen) setMobileOpen(false);
      if (isHovered) setIsHovered(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasScrolledDown, mobileOpen, isHovered]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'navbar');
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
    fetchContent();
  }, []);

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const toggleTheme = () => {
    const next = theme === 'void' ? 'light' : 'void';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  };

  const isActuallyVisible = isHovered || mobileOpen || !hasScrolledDown;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-6 z-[110] bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onClick={() => setIsHovered(prev => !prev)}
      />

      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-md shadow-lg bg-[var(--bg-primary)]/95' : 'bg-transparent'
        } ${isActuallyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="section-container flex items-center justify-between h-20 px-6 md:px-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative font-heading font-black text-xl tracking-wider uppercase text-[var(--text-primary)]"
          >
            {content.logo_text}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="group relative px-1 py-2 text-[10px] font-heading font-bold tracking-[0.2em] uppercase text-[var(--text-primary)]"
              >
                <span className="opacity-60 group-hover:opacity-100 group-hover:text-accent transition-all duration-300">
                  {link.label}
                </span>
              </button>
            ))}
            <button
              onClick={() => handleNavClick('#contact')}
              className="btn-primary text-[10px] py-3 px-8 font-black uppercase tracking-widest hover:scale-105 transition-all"
            >
              {content.cta_text}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle - SVG Icons */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'void' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[var(--text-primary)]"
            >
              {mobileOpen ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-500 bg-[var(--bg-primary)] ${
            mobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'
          }`}
        >
          <div className="section-container py-10 flex flex-col gap-8 px-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-[var(--text-primary)] text-2xl font-heading font-black tracking-widest uppercase text-left"
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
