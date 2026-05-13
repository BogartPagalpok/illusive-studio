import { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  // Use a ref for scroll position to avoid re-triggering the effect loop
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Fetch Content ONCE on mount
    const fetchContent = async () => {
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
    };
    fetchContent();

    // 2. Scroll Logic
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);
      
      // Show if scrolling up, hide if scrolling down
      if (current > lastScrollY.current && current > 150) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = current;
    };

    // 3. Modal Check
    const checkModal = () => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const modalTimer = setInterval(checkModal, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(modalTimer);
    };
  }, []); // Empty dependency array = Runs once. No loops.

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
