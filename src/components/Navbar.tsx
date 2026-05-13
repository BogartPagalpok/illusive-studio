import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  useEffect(() => {
    // 1. Simple Scroll Logic
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // 2. Fetch from Supabase
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
        console.error("Nav Fetch Error:", err);
      }
    };

    window.addEventListener('scroll', handleScroll);
    fetchContent();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled || mobileOpen ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
        {/* LOGO */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-black text-xl text-white uppercase tracking-tighter hover:text-accent transition-colors"
        >
          {content.logo_text}
        </button>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-10">
          {['Services', 'Works', 'About'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="group relative text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              {item}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a 
            href="#contact" 
            className="bg-accent text-black px-7 py-3 rounded-md text-[10px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
          >
            {content.cta_text}
          </a>
        </div>

        {/* MOBILE TOGGLE */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU & GET IN TOUCH */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 bg-black/95 ${mobileOpen ? 'max-h-screen border-t border-white/10' : 'max-h-0'}`}>
        <div className="flex flex-col p-8 gap-8">
          {['Services', 'Works', 'About', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-black uppercase text-white hover:text-accent transition-colors"
            >
              {item}
            </a>
          ))}
          <div className="pt-6 border-t border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 italic">Get In Touch</p>
            <p className="text-white/40 text-sm font-heading">hello@illusive.studio</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
