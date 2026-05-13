import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 1. WATCH FOR MODAL (Via Body Style)
    const checkModal = () => setIsModalOpen(document.body.style.overflow === 'hidden');
    const modalObserver = new MutationObserver(checkModal);
    modalObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    // 2. WATCH FOR WORKS SECTION (Auto-Hide Trigger)
    const worksSection = document.getElementById('works');
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsModalOpen(true);
        } else if (document.body.style.overflow !== 'hidden') {
          setIsModalOpen(false);
        }
      },
      { threshold: 0.15 }
    );

    if (worksSection) sectionObserver.observe(worksSection);

    const fetchContent = async () => {
      const { data } = await supabase.from('site_content').select('key, value').eq('section', 'navbar');
      if (data) {
        const mapped = { ...content };
        data.forEach(row => {
          if (row.key === 'logo_text') mapped.logo_text = row.value;
          if (row.key === 'cta_text') mapped.cta_text = row.value;
        });
        setContent(mapped);
      }
    };

    fetchContent();
    return () => {
      window.removeEventListener('scroll', onScroll);
      modalObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [content]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'backdrop-blur-md shadow-lg bg-[var(--bg-primary)]/95' : 'bg-transparent'
    } ${isModalOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'}`}>
      <div className="section-container flex items-center justify-between h-20">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-heading font-black text-xl tracking-wider uppercase text-[var(--text-primary)]">
          {content.logo_text.split('.').map((part, i) => i === 0 ? part : <span key={i}><span className="text-accent">.</span>{part}</span>)}
        </button>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-heading font-medium tracking-widest uppercase hover:text-accent transition-colors">{link.label}</a>
          ))}
          <a href="#contact" className="btn-primary text-xs py-3 px-6 hover:shadow-[0_0_20px_var(--accent)]">{content.cta_text}</a>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[var(--text-primary)]">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
