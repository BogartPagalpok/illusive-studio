import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Restored the correct named import

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Works', href: '#works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
    const sections = ['services', 'works', 'about', 'contact'];
    const current = sections.find(section => {
      const el = document.getElementById(section);
      if (el) {
        const rect = el.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      }
      return false;
    });
    if (current) setActiveSection(current);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
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
      } catch {
        console.warn('Navbar background sync ignored');
      }
    };

    fetchContent();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
      <div className={`mx-auto max-w-7xl px-6 lg:px-8 transition-all duration-500 rounded-full border ${
          scrolled ? 'bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl py-2' : 'bg-transparent border-transparent py-0'
        }`}>
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative font-heading font-black text-xl tracking-wider uppercase transition-all text-white"
          >
            {content?.logo_text?.includes('.') ? (
              <>
                {content.logo_text.split('.')[0]}<span className="text-accent group-hover:animate-pulse">.</span>{content.logo_text.split('.')[1]}
              </>
            ) : (content?.logo_text || 'IAN.LESTER')}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
          </button>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-5 py-2 text-[10px] font-heading font-black tracking-[0.2em] uppercase transition-all duration-300 rounded-full group ${
                    isActive ? 'text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full shadow-[0_0_10px_var(--accent)]" />
                  )}
                </a>
              );
            })}
            
            <div className="ml-4 pl-4 border-l border-white/10">
              <button
                onClick={(e) => handleNavClick(e, '#contact')}
                className="btn-primary py-2.5 px-8 rounded-full text-[10px] uppercase font-bold"
              >
                {content?.cta_text || 'Hire Me'}
              </button>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex items-center justify-center">
          <button onClick={() => setMobileOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white">
            <X size={32} />
          </button>
          <div className="flex flex-col gap-10 text-center">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-2xl font-heading font-black tracking-[0.3em] uppercase text-white/60 hover:text-accent transition-all"
              >
                {link.label}
              </a>
            ))}
            <button 
              onClick={(e) => handleNavClick(e, '#contact')} 
              className="btn-primary text-sm py-4 px-12 rounded-full uppercase font-bold"
            >
              {content?.cta_text || 'Hire Me'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
