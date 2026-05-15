import { useState, useEffect, useRef } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);

      // Auto-hide logic: Hide on scroll down, show on scroll up
      if (current > lastScrollY.current && current > 120) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  // Show if scroll up OR hovering the sensor
  const isNavShown = visible || isHovered || mobileOpen;

  return (
    <>
      {/* SENSOR ZONE */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-[998] bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
      />

      <motion.nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ y: 0 }}
        animate={{ y: isNavShown ? 0 : -100 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[999] h-20 flex items-center transition-colors duration-500 ${
          scrolled ? 'backdrop-blur-xl bg-black/40 border-b border-white/5 shadow-2xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6 md:px-16">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-black text-2xl uppercase text-white tracking-tighter"
          >
            {content.logo_text}
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="group relative text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-300" />
              </button>
            ))}
            <button 
              onClick={() => handleNavClick('#contact')}
              className="bg-white text-black text-[11px] py-3 px-8 font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
            >
              {content.cta_text}
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
             <span className="text-[10px] font-black tracking-widest">{mobileOpen ? 'CLOSE' : 'MENU'}</span>
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-20 left-0 w-full bg-black/95 backdrop-blur-2xl border-t border-white/10 overflow-hidden"
            >
              <div className="p-10 flex flex-col gap-8">
                {navLinks.map((link) => (
                  <button 
                    key={link.href} 
                    onClick={() => handleNavClick(link.href)} 
                    className="text-white text-4xl font-black uppercase text-left tracking-tighter"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
