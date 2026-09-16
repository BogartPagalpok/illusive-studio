import { useState, useRef, useEffect } from 'react';
import {
  MailDuotone,
  PhoneDuotone,
  InstagramDuotone,
  GithubDuotone,
  FacebookDuotone,
  SparklesDuotone,
  XTwitterDuotone,
  LinkedinDuotone,
  RedditDuotone,
  DiscordDuotone,
} from './icons/StreamlineIcons';
import { supabase } from '../lib/supabase';
import { formatSectionTitle } from '../lib/formatTitle';
import CinematicStage from './CinematicStage';

export default function Footer({ onAdminTrigger }: { onAdminTrigger: () => void }) {
  const [content, setContent] = useState<any>(null);
  const [discordCopied, setDiscordCopied] = useState(false);
  const clickCountRef = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('site_content').select('key, value').eq('section', 'footer').eq('visible', true);
      if (data) {
        const mapped = data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
        setContent(mapped);
      }
    };
    fetchContent();
  }, []);

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleCopyDiscord = (e: React.MouseEvent) => {
    e.preventDefault();
    const handle = content?.discord || 'illusivestudio';
    navigator.clipboard.writeText(handle);
    setDiscordCopied(true);
    setTimeout(() => setDiscordCopied(false), 2500);
  };

  return (
    <CinematicStage id="footer" className="font-heading">
      <div className="section-container relative my-auto w-full max-w-6xl">
        <div 
          className="relative z-10 p-6 sm:p-8 md:p-10 rounded-[28px] border transition-all duration-500 backdrop-blur-[32px] flex flex-col shadow-2xl"
          style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
        >
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start mb-6 gap-8">
            
            <div className="stage-text flex flex-col justify-between h-full min-h-[120px] lg:w-2/5 w-full">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <SparklesDuotone size={16} />
                  <span className="uppercase tracking-[0.2em] font-bold text-xs" style={{ color: 'var(--accent)' }}>Let's Talk</span>
                </div>
                <h3 className="font-black uppercase mb-3 leading-tight break-words w-full" style={{ color: 'var(--text-primary)', fontSize: 'clamp(18px, 2.2vw, 28px)' }}>
                  {formatSectionTitle(content?.hook_heading || "Want to elevate your visual identity? Let's collaborate.")}
                </h3>
                <p className="max-w-md leading-relaxed font-light" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px, 1vw, 15px)' }}>
                  {content?.hook_desc || "From brand systems to digital art — I bring ideas to life with precision and passion."}
                </p>
              </div>
              
              <div className="pt-6">
                <button onClick={() => scrollToSection('contact')} className="btn-primary uppercase tracking-widest font-bold">
                  Book a Call
                </button>
              </div>
            </div>

            <div className="stage-media grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 w-full lg:w-3/5 lg:justify-items-end">
              
              {/* Navigation */}
              <div className="flex flex-col">
                 <h4 className="uppercase tracking-[0.25em] mb-3 sm:mb-4 font-black text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Navigation</h4>
                 <ul className="space-y-2 sm:space-y-2.5 font-semibold uppercase" style={{ fontSize: 'clamp(13px, 0.95vw, 14px)' }}>
                   {['Home', 'Services', 'Works', 'About'].map(item => (
                     <li key={item}>
                       <button onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-accent transition-colors text-left" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>
                         {item}
                       </button>
                     </li>
                   ))}
                 </ul>
              </div>

              {/* Connect */}
              <div className="flex flex-col">
                 <h4 className="uppercase tracking-[0.25em] mb-3 sm:mb-4 font-black text-xs text-[var(--text-secondary)]">Connect</h4>
                 <ul className="space-y-2.5 font-semibold text-xs sm:text-sm">
                   <li>
                     <a href={content?.x || 'https://x.com/il_lusivestudio'} target="_blank" rel="noopener noreferrer" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit text-[var(--text-primary)]">
                       <XTwitterDuotone size={16} className="shrink-0" /> X / Twitter
                     </a>
                   </li>
                   <li>
                     <a href={content?.linkedin || 'https://www.linkedin.com/in/ian-lester-eclevia'} target="_blank" rel="noopener noreferrer" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit text-[var(--text-primary)]">
                       <LinkedinDuotone size={16} className="shrink-0" /> LinkedIn
                     </a>
                   </li>
                   <li>
                     <a href={content?.reddit || 'https://www.reddit.com/user/yhanlhester/'} target="_blank" rel="noopener noreferrer" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit text-[var(--text-primary)]">
                       <RedditDuotone size={16} className="shrink-0" /> Reddit
                     </a>
                   </li>
                   <li>
                     <button
                       type="button"
                       onClick={handleCopyDiscord}
                       className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit text-left cursor-pointer group text-[var(--text-primary)]"
                       title="Click to copy Discord handle"
                     >
                       <DiscordDuotone size={16} className="shrink-0" />
                       <span>Discord</span>
                       <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-accent group-hover:bg-accent group-hover:text-[var(--accent-contrast)] transition-colors">
                         {discordCopied ? 'Copied!' : (content?.discord || 'illusivestudio')}
                       </span>
                     </button>
                   </li>
                   <li>
                     <a href={content?.instagram || 'https://instagram.com'} target="_blank" rel="noopener noreferrer" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit text-[var(--text-primary)]">
                       <InstagramDuotone size={16} className="shrink-0" /> Instagram
                     </a>
                   </li>
                   <li>
                     <a href={content?.github || 'https://github.com'} target="_blank" rel="noopener noreferrer" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit text-[var(--text-primary)]">
                       <GithubDuotone size={16} className="shrink-0" /> GitHub
                     </a>
                   </li>
                   <li>
                     <a href={content?.facebook || 'https://facebook.com'} target="_blank" rel="noopener noreferrer" className="hover:text-accent flex items-center gap-2.5 transition-colors w-fit text-[var(--text-primary)]">
                       <FacebookDuotone size={16} className="shrink-0" /> Facebook
                     </a>
                   </li>
                 </ul>
              </div>

              {/* Contact: Spans full width on mobile so email never breaks */}
              <div className="flex flex-col col-span-2 sm:col-span-1 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                 <h4 className="uppercase tracking-[0.25em] mb-3 sm:mb-4 font-black text-xs text-[var(--text-secondary)]">Contact</h4>
                 <ul className="space-y-2.5 font-medium text-xs sm:text-sm">
                   <li>
                     <a href={`mailto:${content?.email || 'yhanlhester@gmail.com'}`} className="flex items-center gap-2.5 hover:text-accent transition-colors text-[var(--text-primary)]">
                       <MailDuotone size={16} className="shrink-0 text-accent" /> <span className="font-mono text-xs sm:text-sm break-all sm:break-normal">{content?.email || 'yhanlhester@gmail.com'}</span>
                     </a>
                   </li>
                   <li>
                     <a href={`tel:${content?.phone || '+639524437988'}`} className="flex items-center gap-2.5 hover:text-accent transition-colors text-[var(--text-primary)]">
                       <PhoneDuotone size={16} className="shrink-0 text-accent" /> <span className="font-mono text-xs sm:text-sm">{content?.phone || '+639524437988'}</span>
                     </a>
                   </li>
                 </ul>
              </div>

            </div>
          </div>
            
          <div className="relative z-0 w-full flex justify-end mt-1 mb-1 md:mt-0 pointer-events-none select-none overflow-hidden">
            <h2 className="text-[10vw] sm:text-[8vw] md:text-[5vw] lg:text-[3.5vw] font-black uppercase leading-[0.8] tracking-tighter" style={{ color: 'var(--text-primary)', opacity: 0.06 }}>
              IAN LESTER
            </h2>
          </div>

          <div 
            className="stage-element relative z-10 pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-3 uppercase tracking-wider font-semibold text-center md:text-left text-xs"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 text-[var(--text-secondary)]">
              <button 
                onClick={() => { 
                  clickCountRef.current++; 
                  if(clickCountRef.current >= 5) onAdminTrigger(); 
                }} 
                className="hover:text-accent transition-colors cursor-default"
              >
                {`© ${new Date().getFullYear()} Ian Lester Eclevia. All rights reserved.`}
              </button>
              
              <div className="flex items-center justify-center gap-3">
                <a href="/privacy" className="hover:text-accent transition-colors">Privacy</a>
                <span className="text-[var(--text-muted)]">|</span>
                <a href="/terms" className="hover:text-accent transition-colors">Terms</a>
              </div>
            </div>

            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-accent transition-colors mt-1 md:mt-0 font-bold text-[var(--text-secondary)]" aria-label="Scroll back to top of page">
              Back to Top ↑
            </button>
          </div>

        </div>
      </div>
    </CinematicStage>
  );
}
