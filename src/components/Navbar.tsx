import { useState, useEffect } from 'react';
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
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'navbar');

        if (!error && data && data.length > 0) {
          const mapped = { ...content };
          data.forEach(row => {
            if (row.key === 'logo_text') mapped.logo_text = row.value;
            if (row.key === 'cta_text') mapped.cta_text = row.value;
          });
          setContent(mapped);
        }
      } catch {
        // Use defaults
      }
    };

    fetchContent();
    return () => window.removeEventListener('scroll', onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FIX: Using 'any' here bypasses strict DOM element type checking during build
  const handleNavClick = (e: any, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    scrollToId(id);
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
      style={scrolled ? { backgroundColor: 'var(--bg-primary)', opacity: 0.95 } : undefined}
    >
      <div className="section-container flex items-center justify-between h-20">
        
        {/* LOGO: Added group hover for a smooth expanding underline */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group relative font-heading font-black text-xl tracking-wider uppercase transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {content.logo_text.includes('.') ? (
            <>
              {content.logo_text.split('.')[0]}<span className="text-accent group-hover:animate-pulse">.</span>{content.logo_text.split('.')[1]}
            </>
          ) : (
            content.logo_text
          )}
          {/* Animated underline for logo */}
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="group relative px-2 py-1 text-sm font-heading font-medium tracking-widest uppercase transition-all duration-300"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="opacity-60 group-hover:opacity-100 group-hover:text-accent transition-all duration-300">
                {link.label}
              </span>
              {/* Animated glowing bottom border on hover */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300 shadow-[0_0_10px_var(--accent)]" />
            </a>
          ))}
          
          {/* CTA BUTTON: Added hover scale and glow */}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="btn-primary text-xs py-3 px-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_var(--accent)]"
          >
            {content.cta_text}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 hover:text-accent transition-colors duration-300"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden backdrop-blur-lg border-t" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="section-container py-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="group relative inline-block text-lg font-heading font-medium tracking-widest uppercase transition-all duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="opacity-60 group-hover:opacity-100 group-hover:text-accent transition-all duration-300">
                  {link.label}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent opacity-0 group-hover:opacity-100 group-hover:w-8 transition-all duration-300" />
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="btn-primary text-sm py-3 px-6 justify-center mt-4"
            >
              {content.cta_text}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
