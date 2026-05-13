import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);

    // Passive listener: if something else locks the body, we hide. 
    // We don't "ask" what it is.
    const observer = new MutationObserver(() => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    fetchContent();
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [fetchContent]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'backdrop-blur-md bg-black/80' : 'bg-transparent'
    } ${isModalOpen ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-black text-xl text-white uppercase tracking-tighter">
          {content.logo_text}
        </button>
        <div className="hidden md:flex items-center gap-8">
          <a href="#works" className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-accent transition-all">Works</a>
          <a href="#contact" className="bg-accent text-black px-6 py-3 rounded-md text-[10px] font-black uppercase">Hire Me</a>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white"><Menu /></button>
      </div>
    </nav>
  );
}
