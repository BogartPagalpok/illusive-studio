import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const navLinks = [
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'Works', href: '#works', id: 'works' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export default function Navbar() {
  const [navState, setNavState] = useState({ scrolled: false, visible: true });
  const [activeSection, setActiveSection] = useState('home');
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const current = window.scrollY;
      const shouldBeScrolled = current > 50;
      
      // 1. Auto-Hide Logic
      const isScrollingDown = current > lastScrollY.current && current > 150;
      const shouldBeVisible = !isScrollingDown || current < 20;

      setNavState(prev => 
        (prev.scrolled === shouldBeScrolled && prev.visible === shouldBeVisible) 
          ? prev 
          : { scrolled: shouldBeScrolled, visible: shouldBeVisible }
      );

      // 2. Active Section Logic (Replaces your jQuery logic)
      const sections = ['services', 'works', 'about', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
            document.body.className = `page-${section}`; // Sync body class like your jQuery code
            break;
          }
        }
      }
      
      lastScrollY.current = current;
    };

    const observer = new MutationObserver(() => {
      const modalActive = document.body.style.overflow === 'hidden';
      setIsModalOpen(prev => (prev !== modalActive ? modalActive : prev));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

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
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const isActuallyVisible = (navState.visible || isHovered || mobileOpen) && !isModalOpen;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-4 z-[110]" onMouseEnter={() => setIsHovered(true)} />

      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          navState.scrolled || mobileOpen ? 'backdrop-blur-md bg-black/80 shadow-lg' : 'bg-transparent'
        } ${isActuallyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 md:px-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-heading font-black text-xl tracking-wider uppercase text-white">
            {content.logo_text}
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`group relative px-1 py-2 text-[10px] font-heading font-bold tracking-[0.2em] uppercase transition-all duration-300 ${
                  activeSection === link.id ? 'text-accent' : 'text-white/50 hover:text-white'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-300 ${
                  activeSection === link.id ? 'w-full shadow-[0_0_10px_var(--accent)]' : 'w-0 group-hover:w-full'
                }`} />
              </a>
            ))}
            <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="bg-accent text-black px-7 py-3 rounded-md text-[10px] font-black uppercase hover:scale-105 transition-all shadow-xl">
              {content.cta_text}
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white"><Menu size={28} /></button>
        </div>
      </nav>
    </>
  );
}
