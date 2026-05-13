import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      
      // 1. Shadow/Blur Toggle
      setScrolled(current > 50);
      
      // 2. Auto-Hide Logic: Hide only if scrolling down past 150px
      if (current > lastScrollY.current && current > 150) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = current;
    };

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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
      scrolled || mobileOpen ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
    } ${visible || mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
      
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-black text-xl text-white uppercase tracking-tighter hover:text-accent transition-colors">
          {content.logo_text}
        </button>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-10">
          {['Services', 'Works', 'About', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="group relative text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
              {item}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a href="#contact" className="bg-accent text-black px-7 py-3 rounded-md text-[10px] font-black uppercase hover:scale-105 transition-all">
            {content.cta_text}
          </a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 bg-black ${mobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'}`}>
        <div className="flex flex-col p-8 gap-6">
          {['Services', 'Works', 'About', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="text-2xl font-black uppercase text-white">{item}</a>
          ))}
          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-2">Get In Touch</p>
            <p className="text-white/40 text-sm">hello@illusive.studio</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
