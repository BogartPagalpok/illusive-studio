import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // 1. Memoized fetch to prevent re-renders and dependency loops
  const fetchContent = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'navbar');

      if (data) {
        const mapped = { logo_text: 'IAN.LESTER', cta_text: 'Hire Me' };
        data.forEach((row) => {
          if (row.key === 'logo_text') mapped.logo_text = row.value;
          if (row.key === 'cta_text') mapped.cta_text = row.value;
        });
        setContent(mapped);
      }
    } catch (err) {
      console.error('Navbar fetch error:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 2. Handle background blur on scroll
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 3. Observer for body lock (Triggers when View Project Modal is open)
    const checkModal = () => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    };
    
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    fetchContent();

    // 4. Cleanup to prevent memory leaks
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [fetchContent]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
      } ${isModalOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
        {/* LOGO */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="font-heading font-black text-xl tracking-wider uppercase text-white group"
        >
          {content.logo_text.includes('.') ? (
            <>
              {content.logo_text.split('.')[0]}<span className="text-accent">.</span>{content.logo_text.split('.')[1]}
            </>
          ) : content.logo_text}
        </button>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="text-[10px] font-heading font-bold tracking-[0.2em] uppercase text-white/60 hover:text-accent transition-all"
            >
              {link.label}
            </a>
          ))}
          <a 
            href="#contact" 
            className="bg-accent text-black px-6 py-3 rounded-md text-[10px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
          >
            {content.cta_text}
          </a>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="md:hidden text-white p-2"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-black/95 backdrop-blur-2xl border-t border-white/10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-xl font-heading font-black tracking-widest uppercase text-white hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="bg-accent text-black py-4 rounded-md text-center font-black uppercase text-xs"
              >
                {content.cta_text}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
