import { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchContent = async () => {
      const { data } = await supabase.from('site_content').select('key, value').eq('section', 'navbar');
      if (data) {
        const mapped = { logo_text: 'IAN.LESTER', cta_text: 'Hire Me' };
        data.forEach(row => {
          if (row.key === 'logo_text') mapped.logo_text = row.value;
          if (row.key === 'cta_text') mapped.cta_text = row.value;
        });
        setContent(mapped);
      }
    };
    fetchContent();

    const handleScroll = () => {
      const current = window.scrollY;

      // 1. Conditional State Update: Only call setScrolled if the value actually changes
      const isScrolled = current > 50;
      setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));

      // 2. Conditional Visibility: Only call setVisible if the direction changes
      if (current > lastScrollY.current && current > 150) {
        // Scrolling Down - only update if currently visible
        setVisible(prev => (prev !== false ? false : prev));
      } else {
        // Scrolling Up - only update if currently hidden
        setVisible(prev => (prev !== true ? true : prev));
      }
      
      lastScrollY.current = current;
    };

    const checkModal = () => {
      const modalActive = document.body.style.overflow === 'hidden';
      setIsModalOpen(prev => (prev !== modalActive ? modalActive : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const modalTimer = setInterval(checkModal, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(modalTimer);
    };
  }, []);

  // Compute final visibility - this logic is cheap, runs only on re-renders
  const isActive = visible && !isModalOpen;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
        scrolled ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
      } ${isActive ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-black text-xl text-white uppercase tracking-tighter"
        >
          {content.logo_text}
        </button>

        <div className="hidden md:flex items-center gap-10">
          <a href="#services" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-accent transition-colors">Services</a>
          <a href="#works" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-accent transition-colors">Works</a>
          <a href="#about" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-accent transition-colors">About</a>
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
  );
}
