import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  useEffect(() => {
    // 1. Guard for Vercel/SSR
    if (typeof window === 'undefined') return;

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // 2. Simple check for modal: if body is locked, we hide.
    const interval = setInterval(() => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    }, 200);

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
    } ${isModalOpen ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-black text-xl text-white uppercase tracking-tighter">
          {content.logo_text}
        </button>
        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-accent">Services</a>
          <a href="#works" className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-accent">Works</a>
          <a href="#about" className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-accent">About</a>
          <a href="#contact" className="bg-accent text-black px-6 py-3 rounded-md text-[10px] font-black uppercase">{content.cta_text}</a>
        </div>
      </div>
    </nav>
  );
}
