import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  useEffect(() => {
    // 1. SSR GUARD: Prevents Vercel "document is not defined" error
    if (typeof window === 'undefined') return;

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 2. MODAL WATCHER
    const checkModal = () => setIsModalOpen(document.body.style.overflow === 'hidden');
    const modalObserver = new MutationObserver(checkModal);
    modalObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    // 3. SECTION OBSERVER (Safe Check)
    let sectionObserver: IntersectionObserver | null = null;
    const worksSection = document.getElementById('works');
    
    if (worksSection && 'IntersectionObserver' in window) {
      sectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setIsModalOpen(true);
          } else if (document.body.style.overflow !== 'hidden') {
            setIsModalOpen(false);
          }
        },
        { threshold: [0, 0.3] }
      );
      sectionObserver.observe(worksSection);
    }

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
      } catch (err) { console.error(err); }
    };

    fetchContent();

    return () => {
      window.removeEventListener('scroll', onScroll);
      modalObserver.disconnect();
      if (sectionObserver) sectionObserver.disconnect();
    };
  }, []); // Removed 'content' from deps to stop infinite loop

  const shouldHide = isModalOpen && !isHovered;

  return (
    <>
      {/* HOVER TRIGGER */}
      <div 
        className="fixed top-0 left-0 right-0 h-6 z-[99]" 
        onMouseEnter={() => setIsHovered(true)}
      />

      <nav 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out ${
          scrolled ? 'backdrop-blur-md shadow-lg bg-black/90' : 'bg-transparent'
        } ${shouldHide ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-bold text-xl tracking-tighter uppercase text-white">
            {content.logo_text.split('.').map((p, i) => i === 0 ? p : <span key={i}><span className="text-accent">.</span>{p}</span>)}
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-xs uppercase font-bold tracking-widest text-white/60 hover:text-accent transition-colors">{link.label}</a>
            ))}
            <a href="#contact" className="bg-accent text-black px-6 py-3 rounded text-xs font-black uppercase hover:scale-105 transition-transform">{content.cta_text}</a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
    </>
  );
}
