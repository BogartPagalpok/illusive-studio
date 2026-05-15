import { useState, useEffect, useRef } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);

      if (current > lastScrollY.current && current > 100) {
        setVisible(false);
      } else if (current < lastScrollY.current || current < 20) {
        setVisible(true);
      }
      lastScrollY.current = current;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const checkModal = () => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    };

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    async function fetchNavContent() {
      const { data } = await supabase.from('site_content').select('key, value').eq('section', 'navbar');
      if (data) {
        const mapped = { logo_text: 'IAN.LESTER', cta_text: 'Hire Me' };
        data.forEach(row => {
          if (row.key === 'logo_text') mapped.logo_text = row.value;
          if (row.key === 'cta_text') mapped.cta_text = row.value;
        });
        setContent(mapped);
      }
    }

    fetchNavContent();
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const handleNavClick = (href: string) => {
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const isActuallyVisible = (visible || isHovered || mobileOpen) && !isModalOpen;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-20 z-[110] bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-500 ease-in-out ${
          scrolled ? 'backdrop-blur-md bg-black/90' : 'bg-transparent'
        } ${isActuallyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-bold text-xl uppercase text-white">
            {content.logo_text}
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button key={link.href} onClick={() => handleNavClick(link.href)} className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-accent transition-colors">
                {link.label}
              </button>
            ))}
            <button onClick={() => handleNavClick('#contact')} className="btn-primary text-[10px] py-2 px-6">
              {content.cta_text}
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white font-bold text-xs uppercase tracking-tighter">
            {mobileOpen ? '[ CLOSE ]' : '[ MENU ]'}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-black border-t border-white/10 p-6 flex flex-col gap-6">
            {navLinks.map((link) => (
              <button key={link.href} onClick={() => handleNavClick(link.href)} className="text-white text-2xl font-black uppercase text-left">
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
