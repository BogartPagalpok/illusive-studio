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
  const [isHovered, setIsHovered] = useState(false); // To handle the "peek" hover
  const [content, setContent] = useState({ logo_text: 'IAN.LESTER', cta_text: 'Hire Me' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 1. WATCH FOR MODAL (Strictly for the View Project Modal)
    const checkModal = () => setIsModalOpen(document.body.style.overflow === 'hidden');
    const modalObserver = new MutationObserver(checkModal);
    modalObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    // 2. WATCH FOR WORKS SECTION (Improved Threshold)
    const worksSection = document.getElementById('works');
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        // Only hide if we are significantly into the works section (30%)
        // This prevents the "weird" early jump
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          setIsModalOpen(true);
        } else if (document.body.style.overflow !== 'hidden') {
          setIsModalOpen(false);
        }
      },
      { threshold: [0, 0.3, 0.9] } 
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
  }, []);

  // Determine if the Nav should be hidden
  // If hovered, it ALWAYS shows (overrides the hide logic)
  const shouldHide = isModalOpen && !isHovered;

  return (
    <>
      {/* HOVER TRIGGER ZONE: Invisible bar at the top to detect mouse */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-[60]" 
        onMouseEnter={() => setIsHovered(true)}
      />

      <nav 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out ${
          scrolled ? 'backdrop-blur-md shadow-lg bg-[var(--bg-primary)]/95' : 'bg-transparent'
        } ${shouldHide ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}
      >
        <div className="section-container flex items-center justify-between h-20">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-heading font-black text-xl tracking-wider uppercase text-[var(--text-primary)]">
            {content.logo_text.split('.').map((part, i) => i === 0 ? part : <span key={i}><span className="text-accent">.</span>{part}</span>)}
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className="group relative px-2 py-1 text-sm font-heading font-medium tracking-widest uppercase transition-all duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="opacity-60 group-hover:opacity-100 group-hover:text-accent transition-all duration-300">
                  {link.label}
                </span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300 shadow-[0_0_10px_var(--accent)]" />
              </a>
            ))}
            
            <a
              href="#contact"
              className="btn-primary text-xs py-3 px-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_var(--accent)]"
            >
              {content.cta_text}
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[var(--text-primary)]">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden backdrop-blur-lg border-t border-white/10 bg-[var(--bg-primary)]"
            >
              <div className="section-container py-8 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-lg font-heading font-medium tracking-widest uppercase text-[var(--text-primary)]/60 hover:text-accent">
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
