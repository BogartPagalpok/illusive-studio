import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, Phone, Instagram, Github, Facebook, Compass, Scale, Headphones, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  onAdminTrigger: () => void;
}

interface FooterContent {
  hook_heading: string;
  hook_desc: string;
  email: string;
  phone: string;
  instagram: string;
  github: string;
  facebook: string;
  copyright: string;
}

const defaultContent: FooterContent = {
  hook_heading: "Want to elevate your visual identity? Let's collaborate.",
  hook_desc: "From brand systems to digital art — I bring ideas to life with precision and passion.",
  email: 'yhanlhester@gmail.com',
  phone: '524437988',
  instagram: 'https://www.instagram.com/ilucifer0911/',
  github: 'https://github.com/BogartPagalpok',
  facebook: 'https://www.facebook.com/LordOfTheFlies911',
  copyright: `© ${new Date().getFullYear()} Ian Lester Eclevia. All rights reserved.`,
};

export default function Footer({ onAdminTrigger }: FooterProps) {
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovered, setHovered] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<FooterContent>(defaultContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'footer');

        if (!error && data && data.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of data) {
            const key = row.key as keyof FooterContent;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);
        }
      } catch {
        // Use defaults
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    const watermark = watermarkRef.current;
    if (!footer || !watermark) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        watermark,
        { yPercent: 10 },
        {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleNameClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      onAdminTrigger();
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="relative bg-midnight overflow-hidden">
      {/* Fading watermark with parallax */}
      <div
        ref={watermarkRef}
        className="absolute inset-0 flex items-start justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <h2
          className="text-[12vw] md:text-[10vw] font-heading font-black tracking-widest uppercase whitespace-nowrap leading-none pt-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          IAN LESTER
        </h2>
      </div>

      {/* Main footer card */}
      <div className="relative" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="section-container py-16 lg:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

            {/* Col 1 — The Hook */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-accent" />
                <span className="text-xs font-heading tracking-[0.25em] uppercase text-accent">Let's Talk</span>
              </div>
              <p className="text-lg font-heading font-semibold leading-snug mb-3 uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                {content.hook_heading}
              </p>
              <p className="text-sm font-body leading-relaxed mb-6" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                {content.hook_desc}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                  className="btn-primary text-xs py-3 px-6"
                >
                  Book a Call
                </a>
                <a
                  href="#services"
                  onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}
                  className="btn-outline text-xs py-3 px-6"
                >
                  View Services
                </a>
              </div>
            </div>

            {/* Col 2 — Navigation */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Compass size={14} className="text-accent" />
                <h3 className="text-xs font-heading tracking-[0.25em] uppercase" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Navigation</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { label: 'Home', id: 'hero' },
                  { label: 'Services', id: 'services' },
                  { label: 'Works', id: 'works' },
                  { label: 'About', id: 'about' },
                ].map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-sm font-body hover:text-accent transition-colors duration-200"
                      style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Legal */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Scale size={14} className="text-accent" />
                <h3 className="text-xs font-heading tracking-[0.25em] uppercase" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Legal Info</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { label: 'Terms & Conditions', to: '/terms' },
                  { label: 'Privacy Policy', to: '/privacy' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm font-body hover:text-accent transition-colors duration-200"
                      style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Headphones size={14} className="text-accent" />
                <h3 className="text-xs font-heading tracking-[0.25em] uppercase" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Contact Us</h3>
              </div>
              <div className="space-y-3 mb-5">
                <a
                  href={`mailto:${content.email}`}
                  className="flex items-center gap-2 text-sm font-body hover:text-accent transition-colors duration-200"
                  style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
                >
                  <Mail size={14} className="text-accent flex-shrink-0" style={{ opacity: 0.6 }} />
                  {content.email}
                </a>
                <a
                  href={`tel:${content.phone}`}
                  className="flex items-center gap-2 text-sm font-body hover:text-accent transition-colors duration-200"
                  style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
                >
                  <Phone size={14} className="text-accent flex-shrink-0" style={{ opacity: 0.6 }} />
                  {content.phone}
                </a>
              </div>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                className="inline-flex items-center gap-2 px-4 py-2 font-heading font-semibold text-[11px] uppercase tracking-widest rounded-none transition-all duration-300 hover:opacity-90"
                style={{ border: '1px solid var(--accent)', color: 'var(--accent)', opacity: 0.4 }}
              >
                Chat with me
              </a>
            </div>

            {/* Col 5 — Connect */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Instagram size={14} className="text-accent" />
                <h3 className="text-xs font-heading tracking-[0.25em] uppercase" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Connect</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { label: 'Instagram', href: content.instagram, icon: Instagram },
                  { label: 'GitHub', href: content.github, icon: Github },
                  { label: 'Facebook', href: content.facebook, icon: Facebook },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-body hover:text-accent transition-colors duration-200"
                        style={{ color: 'var(--text-secondary)', opacity: 0.6 }}
                      >
                        <Icon size={14} className="text-accent flex-shrink-0" style={{ opacity: 0.6 }} />
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="section-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleNameClick}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="text-xs font-body transition-colors cursor-default select-none"
              style={{ color: hovered ? 'var(--accent)' : 'var(--text-primary)', opacity: hovered ? 1 : 0.2 }}
            >
              {content.copyright}
            </button>

            {/* Back to top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-none flex items-center justify-center hover:bg-accent transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', opacity: 0.3 }}
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
