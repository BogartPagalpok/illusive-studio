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
  const [visible, setVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  const fetchContent = useCallback(async () => {
    const { data } = await supabase.from('site_content').select('key, value').eq('section', 'navbar');
    if (data) {
      const mapped = { logo_text: 'IAN.LESTER', cta_text: 'Hire Me' };
      data.forEach(row => {
        if (row.key === 'logo_text') mapped.logo_text = row.value;
        if (row.key === 'cta_text') mapped.cta_text = row.value;
      });
      setContent(mapped);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
      // Taskbar Logic: Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new MutationObserver(() => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    fetchContent();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [lastScrollY, fetchContent]);

  // Navbar shows if: (Scrolling up) OR (Hovered at top) OR (At top of page)
  // Navbar hides if: (Modal is open)
  const isNavActive = (visible || isHovered) && !isModalOpen;

  return (
    <>
      {/* HOVER TRIGGER ZONE */}
      <div 
        className="fixed top-0 left-0 right-0 h-3 z-[110]" 
        onMouseEnter={() => setIsHovered(true)}
      />

      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          scrolled ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
        } ${isNavActive ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-black text-xl text-white uppercase tracking-tighter">
            {content.logo_text}
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a href="#contact" className="bg-accent text-black px-7 py-3 rounded-md text-[10px] font-black uppercase hover:scale-105 transition-transform">
              {content.cta_text}
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="flex flex-col p-8 gap-6">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-xl font-black uppercase text-white hover:text-accent">
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
