import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Works', href: '#works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [navState, setNavState] = useState({ scrolled: false, visible: true });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Optimized Scroll Handler with Referential Integrity
    const handleScroll = () => {
      const current = window.scrollY;
      const newScrolled = current > 50;
      const isScrollingDown = current > lastScrollY.current && current > 150;
      const newVisible = !isScrollingDown || current < 20;

      setNavState(prev => 
        (prev.scrolled === newScrolled && prev.visible === newVisible) 
          ? prev 
          : { scrolled: newScrolled, visible: newVisible }
      );
      
      lastScrollY.current = current;
    };

    // 2. Performance Fix: MutationObserver replaces the Interval Poll
    const observer = new MutationObserver(() => {
      const modalActive = document.body.style.overflow === 'hidden';
      setIsModalOpen(prev => (prev !== modalActive ? modalActive : prev));
    });

    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });

    // 3. Initial Fetch
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    fetchContent();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect(); // Clean cleanup
    };
  }, []);

  const isActuallyVisible = (navState.visible || mobileOpen) && !isModalOpen;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
        navState.scrolled || mobileOpen ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
      } ${isActuallyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-black text-xl text-white uppercase tracking-tighter hover:text-accent transition-colors"
        >
          {content.logo_text}
        </button>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="group relative text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a 
            href="#contact" 
            className="bg-accent text-black px-7 py-3 rounded-md text-[10px] font-black uppercase hover:scale-105 hover:bg-white transition-all shadow-xl"
          >
            {content.cta_text}
          </a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU & GET IN TOUCH */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 bg-black/95 ${mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col p-8 gap-8 border-t border-white/10">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-2xl font-black uppercase text-white hover:text-accent transition-colors">
              {link.label}
            </a>
          ))}
          <div className="pt-6 border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4">Get In Touch</p>
            <p className="text-white/50 text-sm mb-1 font-heading">hello@illusive.studio</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
