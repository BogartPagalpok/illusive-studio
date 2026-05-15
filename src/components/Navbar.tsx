import { useState, useEffect, useRef } from 'react';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Works', href: '#works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      
      // Auto-hide logic: hide on scroll down, show on scroll up
      if (current > lastScrollY.current && current > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      setScrolled(current > 50);
      lastScrollY.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-20 z-[999] flex items-center transition-all duration-500 ease-in-out
        ${scrolled ? 'bg-black/90 backdrop-blur-md shadow-xl' : 'bg-transparent'}
        ${visible ? 'translate-y-0' : '-translate-y-full hover:translate-y-0'}
      `}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6">
        {/* LOGO */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-black text-xl uppercase text-white tracking-tighter"
        >
          IAN.LESTER
        </button>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button 
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => handleNavClick('#contact')}
            className="bg-white text-black text-[10px] py-2 px-6 font-black uppercase tracking-widest rounded-full hover:bg-white/90 transition-all"
          >
            Hire Me
          </button>
        </div>
      </div>
    </nav>
  );
}
