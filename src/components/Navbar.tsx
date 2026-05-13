import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  const fetchContent = useCallback(async () => {
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
      console.error('Navbar fetch error:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
      // Auto-hide: visible if scrolling up or at the very top
      setVisible(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Hide navbar if any modal locks the body scroll
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

  // Taskbar logic: Show if (scrolling up OR hovered) AND (no modal is open)
  const showNav = (visible || isHovered) && !isModalOpen;

  return (
    <>
      {/* HOVER PEEK TRIGGER: Invisible zone at the very top */}
      <div 
        className="fixed top-0 left-0 right-0 h-2 z-[110]" 
        onMouseEnter={() => setIsHovered(true)} 
      />

      <nav 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          scrolled ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
        } ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="font-black text-xl text-white uppercase tracking-tighter"
          >
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
            <a 
              href="#contact" 
              className="bg-accent text-black px-7 py-3 rounded-md text-[10px] font-black uppercase hover:scale-105 transition-transform"
            >
              {content.cta_text}
            </a>
          </div>

          <button className="md:hidden text-white">
            <Menu size={24} />
          </button>
        </div>
      </nav>
    </>
  );
}
