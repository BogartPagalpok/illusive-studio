import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CloseDuotone, PlayDuotone, ExternalLinkDuotone } from './icons/StreamlineIcons';
import { supabase } from '../lib/supabase';
import ScrollingMasonry from '../components/ScrollingMasonry';
import { formatSectionTitle } from '../lib/formatTitle';
import CinematicStage from './CinematicStage';

interface VideoEntry {
  url: string;
  vertical: boolean;
  title?: string;
  subtitle?: string;
}

interface Project {
  id: string;
  project_group_id?: string;
  visible?: boolean;
  image_layout?: string;
  title: string;
  category: string;
  description?: string;
  image_url: string;
  video_urls?: VideoEntry[] | string[];
  facebook_urls?: string[];
  tools?: string[];
  hero_bg_desktop?: string;
  hero_bg_mobile?: string;
  card_thumbnail?: string;
}

interface CategorySectionProps {
  category: string;
}

interface CopyMapping {
  matcher: (title: string) => boolean;
  title: string;
  description: string;
}

const PORTFOLIO_COPY_MAPPINGS: CopyMapping[] = [
  // 1. Motion & Video Sections
  {
    matcher: (t: string) => /DYNAMIC\s*MICRO[- ]NARRATIVE/i.test(t) || /YOUTUBE\s*SHORTS\s*(&|AND)\s*TIKTOK/i.test(t),
    title: 'YOUTUBE SHORTS & TIKTOK EDITS',
    description: 'High-retention short-form content. Built with fast pacing, clean typography, and solid sound design to hook viewers instantly without feeling over-edited.',
  },
  {
    matcher: (t: string) => /END-TO-END\s*EVENT\s*PRODUCTION/i.test(t) || /LIVE\s*EVENTS\s*(&|AND)\s*SAME-DAY\s*EDITS/i.test(t),
    title: 'LIVE EVENTS & SAME-DAY EDITS (SDE)',
    description: 'On-site shooting, directing, and editing. I handle the full pipeline under tight deadlines to deliver polished recap videos before the event even ends.',
  },
  {
    matcher: (t: string) => /LARGE[- ]FORMAT\s*EVENT\s*VISUALS/i.test(t) || /LED\s*WALLS\s*(&|AND)\s*STAGE\s*VISUALS/i.test(t),
    title: 'LED WALLS & STAGE VISUALS',
    description: 'Custom motion graphics built for massive event screens. Clean, seamless loops designed to elevate the stage without distracting from the live speakers.',
  },
  // 2. Graphic Design Sections
  {
    matcher: (t: string) => /HIGH[- ]IMPACT\s*KEY\s*VISUALS/i.test(t) || /PROMOTIONAL\s*POSTERS\s*(&|AND)\s*KEY\s*VISUALS/i.test(t),
    title: 'PROMOTIONAL POSTERS & KEY VISUALS',
    description: 'Commercial poster design and digital marketing assets. Combining typography, image compositing, and brand identity to make events and products stand out.',
  },
  {
    matcher: (t: string) => /HIGH[- ]IMPACT\s*INFORMATION\s*DESIGN/i.test(t) || /SOCIAL\s*MEDIA\s*CAMPAIGNS\s*(&|AND)\s*INFOGRAPHICS/i.test(t),
    title: 'SOCIAL MEDIA CAMPAIGNS & INFOGRAPHICS',
    description: 'Turning dense information into clean, readable graphics for social media feeds, local government campaigns, and public safety announcements.',
  },
  // 3. UI/UX Section
  {
    matcher: (t: string) => /END-TO-END\s*MOBILE[- ]FIRST/i.test(t) || /UI\/UX\s*(&|AND)\s*WEB\s*APP\s*DESIGN/i.test(t),
    title: 'UI/UX & WEB APP DESIGN',
    description: 'Designing intuitive, mobile-optimized interfaces for web apps. From wireframing the user journey to building out the final frontend layout.',
  },
  // 4. Photography Sections
  {
    matcher: (t: string) => /FRAMES\s*OF\s*THE\s*STREETS/i.test(t) || /^STREET\s*PHOTOGRAPHY$/i.test(t.trim()),
    title: 'STREET PHOTOGRAPHY',
    description: 'Candid street photography focused on natural lighting, urban architecture, and capturing everyday moments across different communities.',
  },
  {
    matcher: (t: string) => /LIVE\s*MUSIC\s*(&|AND)\s*STAGE\s*PERFORMANCE/i.test(t) || /CONCERT\s*(&|AND)\s*EVENT\s*PHOTOGRAPHY/i.test(t),
    title: 'CONCERT & EVENT PHOTOGRAPHY',
    description: 'Shooting live music and stage performances. I focus on capturing the energy of the crowd and the artists under challenging, fast-changing stage lights.',
  },
  {
    matcher: (t: string) => /FACES\s*OF\s*PRIDE/i.test(t) || /EDITORIAL\s*(&|AND)\s*STREET\s*PORTRAITS/i.test(t),
    title: 'EDITORIAL & STREET PORTRAITS',
    description: 'Photojournalistic coverage of local events and parades. Focused on raw emotion, vibrant color grading, and authentic community storytelling.',
  },
];

function normalizeProjectCopy(project: Project): Project {
  for (const mapping of PORTFOLIO_COPY_MAPPINGS) {
    if (mapping.matcher(project.title)) {
      return {
        ...project,
        title: mapping.title,
        description: mapping.description,
      };
    }
  }
  return project;
}

type VideoPlatform = 'youtube' | 'vimeo' | 'tiktok' | null;

function detectVideoPlatform(url: string): VideoPlatform {
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/vimeo\.com/i.test(url)) return 'vimeo';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  return null;
}

function getVideoEmbedUrl(url: string, platform: VideoPlatform): string {
  if (platform === 'youtube') {
    const match = url.match(/(?:v=|\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&controls=1`;
    }
    return url;
  }
  if (platform === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=0` : url;
  }
  return url;
}

function isShort(url: string): boolean {
  return /\/shorts\//.test(url);
}

function getUrl(entry: any): string {
  return typeof entry === 'string' ? entry : entry.url;
}

function getVertical(entry: any): boolean {
  return typeof entry === 'string' ? false : (entry.vertical || false);
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full flex justify-center items-center py-2">
      <div 
        className="phone-card group"
        style={{
          backgroundColor: 'var(--frame-bg, #000000)',
          borderColor: 'var(--frame-border, rgb(40, 40, 40))',
        }}
      >
        {/* Hardware side buttons */}
        <div className="phone-btn1" />
        <div className="phone-btn2" />
        <div className="phone-btn3" />

        {/* Notch / Dynamic Island */}
        <div 
          className="phone-top"
          style={{
            backgroundColor: 'var(--frame-bg, #000000)',
          }}
        >
          <div className="phone-speaker" />
          <div className="phone-camera">
            <div className="phone-int" />
          </div>
        </div>

        {/* Inner Screen */}
        <div className="phone-card-int">
          {children}
        </div>
      </div>
    </div>
  );
}

function BrowserFrame({ children, title }: { children: React.ReactNode; title?: string }) {
  const safeTitle = title || 'SOURCE_01';
  const hash = safeTitle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const minutes = String(hash % 45).padStart(2, '0');
  const seconds = String((hash * 7) % 60).padStart(2, '0');
  const frames = String((hash * 13) % 60).padStart(2, '0');
  const timecode = `01:${minutes}:${seconds}:${frames}`;

  return (
    <div 
      className="davinci-monitor-frame relative w-full group rounded-xl overflow-hidden border shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.18)]"
      style={{
        backgroundColor: 'var(--frame-bg, #101114)',
        borderColor: 'var(--frame-border, #27292e)',
      }}
    >
      {/* DaVinci Resolve Source Monitor Header */}
      <div 
        className="h-7.5 px-3 flex items-center justify-between border-b select-none text-xs font-mono tracking-wider"
        style={{
          backgroundColor: 'var(--frame-header, #18191e)',
          borderBottomColor: 'var(--frame-border, #26282f)',
        }}
      >
        {/* Left: DaVinci Resolve Color Tag & Clip Name */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#e63946]" title="Channel R" />
            <span className="w-2 h-2 rounded-full bg-[#2a9d8f]" title="Channel G" />
            <span className="w-2 h-2 rounded-full bg-[#457b9d]" title="Channel B" />
          </div>
          <span className="font-bold text-white/95 truncate uppercase tracking-widest text-xs max-w-[130px] sm:max-w-[190px]">
            {safeTitle.replace(/\s+/g, '_')}
          </span>
        </div>

        {/* Center: Monospace Timecode with Playhead Status */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/5 text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
          <span className="text-xs tracking-widest font-bold font-mono">{timecode}</span>
        </div>

        {/* Right: Technical Specs */}
        <div className="flex items-center gap-1.5 text-white/70 text-xs shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/90 font-semibold font-mono">4K UHD</span>
          <span className="hidden sm:inline font-mono">60 FPS</span>
        </div>
      </div>

      {/* Video Content Canvas (16:9) with Safe Guides Overlay */}
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        {children}

        {/* DaVinci Viewfinder / Safe-Area Reticle Marks (Non-blocking) */}
        <div className="absolute inset-2.5 sm:inset-4 pointer-events-none border border-white/0 group-hover:border-white/10 transition-colors duration-300 z-10">
          {/* Top-left corner mark */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-accent/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Top-right corner mark */}
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-accent/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Bottom-left corner mark */}
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-accent/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Bottom-right corner mark */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-accent/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Center Crosshair (subtle) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-white" />
          </div>
        </div>
      </div>

      {/* DaVinci Transport / Timeline Scrubber Footer */}
      <div 
        className="h-6.5 px-3 flex items-center justify-between border-t select-none text-xs font-mono text-white/70"
        style={{
          backgroundColor: 'var(--frame-header, #15161a)',
          borderTopColor: 'var(--frame-border, #23252b)',
        }}
      >
        {/* Left: Transport buttons */}
        <div className="flex items-center gap-2 text-white/70">
          <span className="hover:text-accent cursor-default transition-colors text-xs">◀◀</span>
          <span className="hover:text-accent cursor-default transition-colors text-xs">▶</span>
          <span className="hover:text-accent cursor-default transition-colors text-xs">▶▶</span>
        </div>

        {/* Center: Mini Scrubber Track with Playhead */}
        <div className="flex-1 mx-3 h-1.5 rounded-full bg-[#202228] relative overflow-hidden">
          <div 
            className="h-full bg-accent/70 rounded-full transition-all duration-300 group-hover:bg-accent"
            style={{ width: `${30 + (hash % 45)}%` }}
          />
          <div 
            className="absolute top-0 w-1 h-full bg-white shadow-sm"
            style={{ left: `${30 + (hash % 45)}%` }}
          />
        </div>

        {/* Right: Audio Stereo VU Meter Peak Display */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-white/70">LR</span>
          <div className="flex gap-0.5 items-end h-2.5">
            <span className="w-1 h-2 bg-[#2a9d8f] rounded-[0.5px]" />
            <span className="w-1 h-2.5 bg-[#e9c46a] rounded-[0.5px]" />
            <span className="w-1 h-1.5 bg-[#e63946] rounded-[0.5px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

const vimeoThumbnailCache = new Map<string, string>();

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

function useVideoThumbnail(url: string, platform: VideoPlatform, posterUrl?: string) {
  const [thumb, setThumb] = useState<string | null>(() => {
    if (posterUrl && posterUrl.trim() !== '') return posterUrl;
    if (platform === 'youtube') {
      const match = url.match(/(?:v=|\/|shorts\/)([a-zA-Z0-9_-]{11})/);
      return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
    }
    if (platform === 'vimeo') {
      const vimeoId = extractVimeoId(url);
      return vimeoId ? vimeoThumbnailCache.get(vimeoId) || null : null;
    }
    return null;
  });

  useEffect(() => {
    if (thumb) return;
    if (platform === 'vimeo') {
      const vimeoId = extractVimeoId(url);
      if (!vimeoId) return;

      const cached = vimeoThumbnailCache.get(vimeoId);
      if (cached) {
        setThumb(cached);
        return;
      }

      let active = true;
      fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${vimeoId}`)}&width=640`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (active && data && data.thumbnail_url) {
            vimeoThumbnailCache.set(vimeoId, data.thumbnail_url);
            setThumb(data.thumbnail_url);
          }
        })
        .catch(() => {});

      return () => {
        active = false;
      };
    }
  }, [url, platform, thumb]);

  return thumb;
}

function VideoFacade({
  url,
  platform,
  title,
  posterUrl,
}: {
  url: string;
  platform: VideoPlatform;
  title: string;
  posterUrl?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const displayPoster = useVideoThumbnail(url, platform, posterUrl);

  if (isPlaying) {
    let embedUrl = getVideoEmbedUrl(url, platform);
    if (platform === 'youtube') {
      embedUrl = embedUrl.replace('autoplay=0', 'autoplay=1');
    } else if (platform === 'vimeo') {
      embedUrl = embedUrl.replace('autoplay=0', 'autoplay=1');
    }

    return (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        title={title}
      />
    );
  }

  return (
    <div
      className="relative w-full h-full group cursor-pointer overflow-hidden bg-black flex items-center justify-center select-none"
      onClick={() => setIsPlaying(true)}
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsPlaying(true);
        }
      }}
    >
      {displayPoster ? (
        <img
          src={displayPoster}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center p-4">
          <span className="text-zinc-400 text-xs text-center font-medium line-clamp-2">{title}</span>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
        <div className="w-12 h-12 rounded-full bg-accent/90 text-white flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
          <PlayDuotone size={22} className="translate-x-0.5" primaryColor="var(--accent-contrast, #000000)" secondaryColor="rgba(0,0,0,0.25)" />
        </div>
      </div>
    </div>
  );
}

function FlipCard({ project, isHero = false }: { project: Project; isHero?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleCardClick = () => {
    if (isMobile) {
      setFlipped(prev => !prev);
    } else {
      setSelected(true);
    }
  };

  return (
    <>
      <div
        className={`flip-card cursor-pointer w-full ${isHero ? 'hero-card' : ''}`}
        style={{ perspective: '1000px' }}
        onClick={handleCardClick}
        onMouseEnter={() => { if (!isMobile) setFlipped(true); }}
        onMouseLeave={() => { if (!isMobile) setFlipped(false); }}
      >
        <div
          className="flip-card-inner relative w-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.8s',
          }}
        >
          <div
            className="flip-card-front relative w-full rounded-xl overflow-hidden border"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderColor: 'var(--glass-border)',
            }}
          >
            <img
              src={project.hero_bg_desktop || project.image_url}
              alt={project.title}
              className={`w-full block ${isHero ? 'h-full object-cover' : 'h-auto'}`}
              loading="lazy"
              style={isHero ? { minHeight: '300px' } : undefined}
            />
            <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-xs font-bold uppercase tracking-wider">{project.title}</p>
              {isMobile && <p className="text-white/80 text-xs mt-0.5 font-medium">Tap to flip</p>}
            </div>
          </div>
          <div
            className="flip-card-back absolute inset-0 w-full h-full rounded-xl overflow-hidden border flex flex-col justify-center items-center p-4"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'var(--glass-bg)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <h3 className="font-black uppercase text-center" style={{ fontSize: '1.2em', color: 'var(--text-primary)' }}>{project.title}</h3>
            {project.description && (
              <p className="text-xs mt-2 leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
            )}
            {project.tools && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                {project.tools.slice(0, 3).map(t => (
                  <span key={t} className="px-2 py-0.5 text-xs uppercase tracking-wider rounded border" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{t}</span>
                ))}
              </div>
            )}
            {isMobile && <p className="text-accent text-xs mt-3 font-bold">Tap to view full</p>}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)', touchAction: 'none' }}
            onClick={() => setSelected(false)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelected(false)} className="absolute top-4 right-4 p-2.5 rounded-full border transition-all z-[10000]" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
              <CloseDuotone size={18} />
            </button>
            <img src={project.hero_bg_desktop || project.image_url} alt={project.title} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GraphicsCompositeCard({ images, title, description, tools, layout }: { images: string[]; title: string; description?: string; tools?: string[]; layout?: string }) {
  const [flipped, setFlipped] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16-9' | 'square'>('square');

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (layout === '4up-grid-16-9') {
      setAspectRatio('16-9');
      return;
    }
    if (!images[0]) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth / img.naturalHeight >= 1.35) {
        setAspectRatio('16-9');
      } else {
        setAspectRatio('square');
      }
    };
    img.src = images[0];
  }, [images, layout]);

  const count = images.length;
  const displayImages = images.slice(0, 6);
  const remaining = count > 6 ? count - 6 : 0;

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedIndex(index);
    setSelectedImage(images[index]);
  };

  const handleCardClick = () => {
    if (isMobile) {
      setFlipped(prev => !prev);
    } else {
      setSelectedIndex(0);
      setSelectedImage(images[0]);
    }
  };

  return (
    <>
      <div
        className="flip-card cursor-pointer w-full group"
        style={{ perspective: '1000px' }}
        onClick={handleCardClick}
      >
        <div
          className="flip-card-inner relative w-full group-hover:scale-[1.02]"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.8s, box-shadow 0.3s',
            boxShadow: flipped ? 'none' : '0 0 20px rgba(157, 0, 255, 0.15)',
          }}
        >      
          <div
            className="flip-card-front relative w-full rounded-xl overflow-hidden border"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderColor: 'var(--glass-border)',
              backgroundColor: 'transparent', /* Changed from var(--bg-primary) */
            }}
          >
            {count === 3 ? (
              <div className="grid grid-cols-2 gap-1 p-1">
                <div className="row-span-2 cursor-pointer overflow-hidden" onClick={(e) => handleImageClick(e, 0)}>
                  <img src={displayImages[0]} alt={`${title} 1`} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="cursor-pointer overflow-hidden aspect-square" onClick={(e) => handleImageClick(e, 1)}>
                  <img src={displayImages[1]} alt={`${title} 2`} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="cursor-pointer overflow-hidden aspect-square" onClick={(e) => handleImageClick(e, 2)}>
                  <img src={displayImages[2]} alt={`${title} 3`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            ) : count === 4 ? (
              <div className="grid grid-cols-2 gap-1 p-1">
                {displayImages.map((img, i) => (
                  <div
                    key={i}
                    className={`cursor-pointer overflow-hidden ${aspectRatio === '16-9' ? 'aspect-[16/9]' : 'aspect-square'}`}
                    onClick={(e) => handleImageClick(e, i)}
                  >
                    <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 p-1">
                {displayImages.map((img, i) => (
                  <div
                    key={i}
                    className="cursor-pointer overflow-hidden aspect-square relative"
                    onClick={(e) => handleImageClick(e, i)}
                  >
                    <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    {i === 5 && remaining > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">+{remaining}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <p className="text-white text-xs font-bold uppercase tracking-wider">{title}</p>
              {isMobile && <p className="text-white/80 text-xs mt-0.5 font-medium">Tap to flip</p>}
            </div>
          </div>
          <div
            className="flip-card-back absolute inset-0 w-full h-full rounded-xl overflow-hidden border flex flex-col justify-center items-center p-4"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: 'var(--glass-bg)',
              borderColor: 'var(--glass-border)',
            }}
          >
            <h3 className="font-black uppercase text-center" style={{ fontSize: '1.2em', color: 'var(--text-primary)' }}>{title}</h3>
            {description && (
              <p className="text-xs mt-2 leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            )}
            {tools && tools.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                {tools.slice(0, 3).map(t => (
                  <span key={t} className="px-2 py-0.5 text-xs uppercase tracking-wider rounded border" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{t}</span>
                ))}
              </div>
            )}
            {isMobile && <p className="text-accent text-xs mt-3 font-bold">Tap to view full</p>}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)', touchAction: 'none' }}
            onClick={() => setSelectedImage(null)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2.5 rounded-full border transition-all z-[10000]" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
              <CloseDuotone size={18} />
            </button>
            <img src={selectedImage} alt={title} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(i);
                      setSelectedImage(images[i]);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${i === selectedIndex ? 'bg-white scale-125' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FacebookEmbed({ url }: { url: string }) {
  const cleanUrl = url.includes('iframe') 
    ? url.match(/href=["']?(https:\/\/www\.facebook\.com\/[^"'\s&]+)/)?.[1] || url
    : url;
  
  const embedUrl = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(cleanUrl)}&show_text=true&width=500`;
  
  return (
    <div className="w-full flex justify-center">
      <iframe 
        src={embedUrl}
        width="500"
        style={{ border: 'none', overflow: 'hidden', maxWidth: '100%', minHeight: '400px', height: 'auto' }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen={true}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        loading="lazy"
      />
    </div>
  );
}

function MotionPanel({ title, description, tools, videoItems }: { title: string; description?: string; tools?: string[]; videoItems: Array<{ url: string; platform: VideoPlatform; projectId: string; projectTitle: string; vertical: boolean; posterUrl?: string; title?: string; subtitle?: string }> }) {
  const displayVideos = videoItems.slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 my-auto">
      {/* Centered Media Stage: Sweeps in left to right */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-h-[56vh]">
        {displayVideos.map((item, i) => {
          const usePhone = item.platform === 'tiktok' || item.vertical || (item.platform === 'youtube' && isShort(item.url));
          const cardTitle = item.title || item.projectTitle;

          return (
            <div key={`${item.projectId}-${i}`} className="stage-media flex flex-col items-center justify-center max-h-[54vh]">
              {usePhone ? (
                <div className="max-h-[50vh] flex items-center justify-center">
                  <PhoneFrame>
                    {item.platform === 'tiktok' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 p-4">
                        <PlayDuotone size={32} className="mb-2" primaryColor="rgba(255,255,255,0.8)" secondaryColor="rgba(255,255,255,0.2)" />
                        <p className="text-white/80 text-xs text-center mb-3 font-medium">{cardTitle}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs rounded-full font-bold hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}>
                          <ExternalLinkDuotone size={14} primaryColor="var(--accent-contrast, #000000)" secondaryColor="rgba(0,0,0,0.25)" /> Watch on TikTok
                        </a>
                      </div>
                    ) : (
                      <VideoFacade
                        url={item.url}
                        platform={item.platform!}
                        title={cardTitle}
                        posterUrl={item.posterUrl}
                      />
                    )}
                  </PhoneFrame>
                </div>
              ) : (
                <div className="w-full max-w-2xl max-h-[50vh]">
                  <BrowserFrame title={cardTitle}>
                    <VideoFacade
                      url={item.url}
                      platform={item.platform!}
                      title={cardTitle}
                      posterUrl={item.posterUrl}
                    />
                  </BrowserFrame>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cinematic Lower-Third Glass Overlay: Lands bottom to top */}
      <div 
        className="stage-text w-full max-w-4xl mt-6 px-6 py-4 rounded-2xl border backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xl"
        style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">MOTION // FEATURED</span>
          </div>
          <h3 className="text-base sm:text-xl font-heading font-black uppercase tracking-wider text-[var(--text-primary)]">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mt-1">
              {description}
            </p>
          )}
        </div>

        {tools && tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {tools.map(t => (
              <span key={t} className="px-2.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider rounded-md border text-[var(--text-secondary)]" style={{ borderColor: 'var(--glass-border)' }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategorySection({ category }: CategorySectionProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnCount, setColumnCount] = useState(3);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .ilike('category', `${category.trim()}%`)
        .eq('visible', true)
        .order('sort_order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true });
      if (error) {
        const fallback = await supabase
          .from('portfolio_projects')
          .select('*')
          .ilike('category', `${category.trim()}%`)
          .order('sort_order', { ascending: true, nullsFirst: true })
          .order('created_at', { ascending: true });
        data = fallback.data;
        error = fallback.error;
      }
      if (error) throw error;
      setProjects((data || []).map(normalizeProjectCopy));
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__lenis) {
          window.__lenis.resize();
        }
      }, 100);
    } catch (err) {
      console.error(`Failed to fetch ${category} projects:`, err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1024) setColumnCount(4);
      else if (width >= 768) setColumnCount(2);
      else setColumnCount(1);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  if (!loading && projects.length === 0) return null;

  const groupedByProject = projects.reduce((acc, project) => {
    const fallbackKey = `${project.category}:${project.title.trim().toLowerCase()}`;
    const projectKey = project.project_group_id || fallbackKey;
    if (!acc[projectKey]) acc[projectKey] = [];
    acc[projectKey].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  const visibleGroups = Object.entries(groupedByProject).filter(([, projectRows]) => {
    return projectRows.some(p =>
      p.image_url || 
      (p.video_urls && p.video_urls.length > 0 && p.video_urls.some((entry: any) => {
        const url = getUrl(entry);
        return url && url.trim().length > 0;
      })) ||
      (p.facebook_urls && p.facebook_urls.length > 0)
    );
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (visibleGroups.length === 0) return null;

  const isGraphics = category === 'Graphic Design';
  const isMotion = category === 'Motion';
  const isPhotography = category === 'Photography';
  const isUIUX = category === 'UI/UX';

  return (
    <>
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )}

      {/* Photography: 100vh CinematicStage */}
      {isPhotography && (
        <CinematicStage id="photography">
          <div className="section-container relative flex flex-col items-center justify-center w-full max-w-6xl my-auto">
            <div className="stage-text section-header-gap text-center flex flex-col items-center">
              <span className="section-subtitle">FEATURED WORK //</span>
              <h2 className="section-title">PHOTOGRAPHY & <span className="text-accent">VISUAL STORIES</span></h2>
              <div className="section-divider" />
            </div>

            <div className="stage-media w-full max-h-[50vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <ScrollingMasonry projects={projects} height={420} speed={90} />
            </div>

            <div
              className="stage-text w-full max-w-3xl mt-4 px-6 py-3 rounded-xl border backdrop-blur-xl text-center shadow-lg"
              style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
            >
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-body">
                Candid street moments, dynamic live stage concerts, and authentic editorial community storytelling.
              </p>
            </div>
          </div>
        </CinematicStage>
      )}

      {/* UI/UX: 100vh CinematicStage */}
      {isUIUX && (
        <CinematicStage id="uiux">
          <div className="section-container relative flex flex-col items-center justify-center w-full max-w-6xl my-auto">
            <div className="stage-text section-header-gap text-center flex flex-col items-center">
              <span className="section-subtitle">FEATURED WORK //</span>
              <h2 className="section-title">UI/UX & WEB APP <span className="text-accent">DESIGN</span></h2>
              <div className="section-divider" />
            </div>

            <div className="stage-media w-full max-h-[50vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <ScrollingMasonry projects={projects} height={420} speed={90} />
            </div>

            <div
              className="stage-text w-full max-w-3xl mt-4 px-6 py-3 rounded-xl border backdrop-blur-xl text-center shadow-lg"
              style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
            >
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-body">
                Designing intuitive, mobile-optimized interfaces and high-conversion design systems for modern web applications.
              </p>
            </div>
          </div>
        </CinematicStage>
      )}

      {/* Motion: Each project group in its own 100vh CinematicStage */}
      {isMotion &&
        visibleGroups.map(([projectKey, projectRows]) => {
          const title = projectRows[0]?.title || 'Untitled';
          const allVideos: Array<{
            url: string;
            platform: VideoPlatform;
            projectId: string;
            projectTitle: string;
            vertical: boolean;
            posterUrl?: string;
            title?: string;
            subtitle?: string;
          }> = [];
          let titleDescription = '';
          let titleTools: string[] = [];

          projectRows.forEach(project => {
            if (project.description && !titleDescription) titleDescription = project.description;
            if (project.tools && project.tools.length > 0 && titleTools.length === 0) titleTools = project.tools;
            const urls = project.video_urls || [];
            urls.forEach(entry => {
              const url = getUrl(entry);
              const vertical = getVertical(entry);
              const platform = detectVideoPlatform(url);
              if (platform) {
                allVideos.push({
                  url,
                  platform,
                  projectId: project.id,
                  projectTitle: project.title,
                  vertical,
                  posterUrl: project.card_thumbnail || project.image_url || undefined,
                  title: (entry as VideoEntry).title || undefined,
                  subtitle: (entry as VideoEntry).subtitle || undefined,
                });
              }
            });
          });

          if (allVideos.length === 0) return null;

          return (
            <CinematicStage key={projectKey} id={`motion-${projectKey.replace(/[^a-z0-9]+/gi, '-')}`}>
              <MotionPanel
                title={title}
                description={titleDescription}
                tools={titleTools}
                videoItems={allVideos}
              />
            </CinematicStage>
          );
        })}

      {/* Graphic Design: Each project group in its own 100vh CinematicStage */}
      {isGraphics &&
        visibleGroups.map(([projectKey, projectRows]) => {
          const title = projectRows[0]?.title || 'Untitled';
          const graphicImages = projectRows
            .map(p => p.image_url)
            .filter(Boolean)
            .slice(0, 3);
          const desc = projectRows.find(p => p.description)?.description || '';
          const tools = projectRows.find(p => p.tools && p.tools.length > 0)?.tools || [];

          if (graphicImages.length === 0) return null;

          return (
            <CinematicStage key={projectKey} id={`graphics-${projectKey.replace(/[^a-z0-9]+/gi, '-')}`}>
              <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 my-auto">
                {/* Dead Center Artwork: max-h-[56vh] so nothing overflows 100vh */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-h-[56vh]">
                  {graphicImages.map((img, i) => (
                    <div key={i} className="stage-media max-h-[54vh] flex items-center justify-center">
                      <img
                        src={img}
                        alt={`${title} ${i + 1}`}
                        className="max-h-[52vh] w-auto max-w-full object-contain rounded-2xl border border-white/15 shadow-2xl hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                        onClick={() => setSelectedImage(img)}
                      />
                    </div>
                  ))}
                </div>

                {/* Lower-Third Glass Overlay: Lands bottom to top */}
                <div 
                  className="stage-text w-full max-w-4xl mt-6 px-6 py-4 rounded-2xl border backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xl"
                  style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">GRAPHIC DESIGN // FEATURED</span>
                    </div>
                    <h3 className="text-base sm:text-xl font-heading font-black uppercase tracking-wider text-[var(--text-primary)]">
                      {title}
                    </h3>
                    {desc && (
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mt-1">
                        {desc}
                      </p>
                    )}
                  </div>

                  {tools && tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {tools.map(t => (
                        <span key={t} className="px-2.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider rounded-md border text-[var(--text-secondary)]" style={{ borderColor: 'var(--glass-border)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CinematicStage>
          );
        })}

      {/* Selected Image Fullscreen Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)', touchAction: 'none' }}
            onClick={() => setSelectedImage(null)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full border transition-all z-[10000]"
              style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
            >
              <CloseDuotone size={18} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
