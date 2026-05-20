import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Play, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Project {
  id: string;
  title: string;
  category: string;
  description?: string;
  image_url: string;
  video_urls?: string[];
  tools?: string[];
  hero_bg_desktop?: string;
  hero_bg_mobile?: string;
  card_thumbnail?: string;
  image_layout?: string;
  project_url?: string;
}

interface CategorySectionProps {
  category: string;
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

// ── Phone Frame (unchanged) ─────────────────────────────
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: '210px', aspectRatio: '210/400' }}>
      <style>{`
        .phone-card {
          width: 100%;
          height: 100%;
          background: black;
          border-radius: 35px;
          border: 2px solid rgb(40, 40, 40);
          padding: 7px;
          position: relative;
          box-shadow: 2px 5px 15px rgba(0, 0, 0, 0.486);
        }
        .phone-screen {
          height: 100%;
          border-radius: 25px;
          overflow: hidden;
          background: black;
        }
        .phone-top {
          position: absolute;
          top: 0px;
          right: 50%;
          transform: translate(50%, 0%);
          width: 35%;
          height: 18px;
          background-color: black;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          z-index: 10;
        }
        .phone-speaker {
          position: absolute;
          top: 2px;
          right: 50%;
          transform: translate(50%, 0%);
          width: 40%;
          height: 2px;
          border-radius: 2px;
          background-color: rgb(20, 20, 20);
          z-index: 10;
        }
        .phone-camera {
          position: absolute;
          top: 6px;
          right: 84%;
          transform: translate(50%, 0%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.048);
          z-index: 10;
        }
        .phone-btn1, .phone-btn2, .phone-btn3 {
          position: absolute;
          width: 2px;
        }
        .phone-btn1 {
          height: 45px;
          top: 30%;
          right: -3px;
          background-image: linear-gradient(to right, #111, #333, #595959);
          border-radius: 0 2px 2px 0;
        }
        .phone-btn2 {
          height: 30px;
          top: 26%;
          left: -3px;
          background-image: linear-gradient(to left, #111, #333, #595959);
          border-radius: 2px 0 0 2px;
        }
        .phone-btn3 {
          height: 30px;
          top: 36%;
          left: -3px;
          background-image: linear-gradient(to left, #111, #333, #595959);
          border-radius: 2px 0 0 2px;
        }
      `}</style>

      <div className="phone-card">
        <div className="phone-screen">
          {children}
        </div>
        <div className="phone-top" />
        <div className="phone-speaker" />
        <div className="phone-camera" />
        <div className="phone-btn1" />
        <div className="phone-btn2" />
        <div className="phone-btn3" />
      </div>
    </div>
  );
}

// ── Landscape Frame (for Motion videos) ─────────────────
function LandscapeFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      <div className="relative w-full h-full bg-zinc-900 rounded-xl overflow-hidden border border-zinc-600 shadow-lg">
        <div className="w-full h-full bg-black">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Flip Card (unchanged) ───────────────────────────────
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
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-xs font-bold uppercase tracking-wider">{project.title}</p>
              {isMobile && <p className="text-white/50 text-[8px] mt-0.5">Tap to flip</p>}
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
              <div className="flex flex-wrap gap-1 mt-3 justify-center">
                {project.tools.slice(0, 3).map(t => (
                  <span key={t} className="px-2 py-0.5 text-[8px] uppercase tracking-wider rounded border" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{t}</span>
                ))}
              </div>
            )}
            {isMobile && <p className="text-accent text-[8px] mt-3 font-bold">Tap to view full</p>}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
            onClick={() => setSelected(false)}
          >
            <button onClick={() => setSelected(false)} className="absolute top-4 right-4 p-2.5 rounded-full border transition-all z-[10000]" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
              <X size={18} />
            </button>
            <img src={project.hero_bg_desktop || project.image_url} alt={project.title} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Graphics Composite Card ─────────────────────────────
function GraphicsCompositeCard({ images, title, description, tools }: { images: string[]; title: string; description?: string; tools?: string[] }) {
  const [flipped, setFlipped] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const count = images.length;
  const displayImages = images.slice(0, 6);
  const remaining = count > 6 ? count - 6 : 0;

  const getGridClass = () => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    if (count === 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedIndex(index);
    setSelectedImage(images[index]);
  };

  const handleCardClick = () => {
    if (isMobile) {
      setFlipped(prev => !prev);
    }
  };

  return (
    <>
      <div
        className="flip-card cursor-pointer w-full"
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
          {/* Front - Image Grid */}
          <div
            className="flip-card-front relative w-full rounded-xl overflow-hidden border"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderColor: 'var(--glass-border)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <div className={`grid ${getGridClass()} gap-1 p-1`}>
              {count === 3 ? (
                <>
                  <div
                    className="row-span-2 cursor-pointer overflow-hidden"
                    onClick={(e) => handleImageClick(e, 0)}
                  >
                    <img src={displayImages[0]} alt={`${title} 1`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="cursor-pointer overflow-hidden" onClick={(e) => handleImageClick(e, 1)}>
                    <img src={displayImages[1]} alt={`${title} 2`} className="w-full h-full object-cover aspect-square" loading="lazy" />
                  </div>
                  <div className="cursor-pointer overflow-hidden" onClick={(e) => handleImageClick(e, 2)}>
                    <img src={displayImages[2]} alt={`${title} 3`} className="w-full h-full object-cover aspect-square" loading="lazy" />
                  </div>
                </>
              ) : (
                displayImages.map((img, i) => (
                  <div
                    key={i}
                    className={`cursor-pointer overflow-hidden relative ${i === 5 && remaining > 0 ? 'overlay-container' : ''}`}
                    onClick={(e) => handleImageClick(e, i)}
                  >
                    <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover aspect-square" loading="lazy" />
                    {i === 5 && remaining > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">+{remaining}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-xs font-bold uppercase tracking-wider">{title}</p>
              {isMobile && <p className="text-white/50 text-[8px] mt-0.5">Tap to flip</p>}
            </div>
          </div>

          {/* Back - Info */}
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
              <div className="flex flex-wrap gap-1 mt-3 justify-center">
                {tools.slice(0, 3).map(t => (
                  <span key={t} className="px-2 py-0.5 text-[8px] uppercase tracking-wider rounded border" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{t}</span>
                ))}
              </div>
            )}
            {isMobile && <p className="text-accent text-[8px] mt-3 font-bold">Tap to view full</p>}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
            onClick={() => setSelectedImage(null)}
          >
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2.5 rounded-full border transition-all z-[10000]" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
              <X size={18} />
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

// ── Motion Panel Layout ─────────────────────────────────
function MotionPanel({ title, description, tools, videoItems, imageItems }: { title: string; description?: string; tools?: string[]; videoItems: Array<{ url: string; platform: VideoPlatform; projectId: string; projectTitle: string }>; imageItems: Project[] }) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Left Panel - Title & Description */}
      <div className="lg:w-1/4 flex flex-col justify-center p-6 rounded-xl border backdrop-blur-xl" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
        <h3 className="text-xl font-heading font-black uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        {description && (
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        )}
        {tools && tools.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tools.map(t => (
              <span key={t} className="px-3 py-1 text-[10px] uppercase tracking-wider rounded-full border" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Videos Grid */}
      <div className="lg:w-3/4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoItems.map((item, i) => (
            <div key={`${item.projectId}-video-${i}`} className="break-inside-avoid">
              <LandscapeFrame>
                {item.platform === 'tiktok' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 p-4">
                    <Play size={32} className="text-white/50 mb-2" />
                    <p className="text-white/70 text-xs text-center mb-3">{item.projectTitle}</p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs rounded-full font-bold hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={12} /> Watch on TikTok
                    </a>
                  </div>
                ) : (
                  <iframe
                    src={getVideoEmbedUrl(item.url, item.platform!)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title={item.projectTitle}
                  />
                )}
              </LandscapeFrame>
              <p className="text-center text-[10px] font-heading font-bold uppercase tracking-wider mt-2" style={{ color: 'var(--text-primary)' }}>{item.projectTitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Title Grid (for non-Graphics, non-Motion categories) ─
function TitleGrid({ projects, categoryIndex }: { projects: Project[]; categoryIndex: number }) {
  const [columnCount, setColumnCount] = useState(3);

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

  const allCards: Array<{ type: 'image' | 'video'; project: Project; videoUrl?: string; platform?: VideoPlatform }> = [];
  
  projects.forEach(project => {
    if (project.image_url) {
      allCards.push({ type: 'image', project });
    }
    const urls = project.video_urls || [];
    urls.forEach(videoUrl => {
      const platform = detectVideoPlatform(videoUrl);
      if (platform) {
        allCards.push({ type: 'video', project, videoUrl, platform });
      }
    });
  });

  if (allCards.length === 0) return null;

  const hasGap = allCards.length % columnCount !== 0;
  const lastIndex = allCards.length - 1;
  const isOdd = categoryIndex % 2 === 0;

  // For alternating hero pattern
  const heroCard = allCards.find(c => c.type === 'image');
  const remainingCards = heroCard ? allCards.filter(c => c !== heroCard) : allCards;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Hero side */}
      <div className={isOdd ? 'lg:w-1/2 lg:order-2' : 'lg:w-1/2 lg:order-1'}>
        {heroCard && (
          <FlipCard project={heroCard.project} isHero={true} />
        )}
      </div>
      {/* Small items side */}
      <div className={isOdd ? 'lg:w-1/2 lg:order-1' : 'lg:w-1/2 lg:order-2'}>
        <div className="grid grid-cols-2 gap-4">
          {remainingCards.map((card, index) => {
            if (card.type === 'video') {
              return (
                <div key={`${card.project.id}-video-${index}`} className="break-inside-avoid">
                  <PhoneFrame>
                    {card.platform === 'tiktok' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 p-4">
                        <Play size={24} className="text-white/50 mb-1" />
                        <p className="text-white/70 text-[10px] text-center mb-2">{card.project.title}</p>
                        <a href={card.videoUrl!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-accent text-white text-[8px] rounded-full font-bold hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink size={10} /> Watch
                        </a>
                      </div>
                    ) : (
                      <iframe
                        src={getVideoEmbedUrl(card.videoUrl!, card.platform!)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                        title={card.project.title}
                      />
                    )}
                  </PhoneFrame>
                </div>
              );
            }
            return (
              <div key={card.project.id} className="break-inside-avoid">
                <FlipCard project={card.project} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main CategorySection ────────────────────────────────
export default function CategorySection({ category }: CategorySectionProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .ilike('category', category.trim())
        .order('created_at', { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error(`Failed to fetch ${category} projects:`, err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  if (!loading && projects.length === 0) return null;

  const groupedByTitle = projects.reduce((acc, project) => {
    const title = project.title || 'Untitled';
    if (!acc[title]) acc[title] = [];
    acc[title].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  const visibleGroups = Object.entries(groupedByTitle).filter(([_, titleProjects]) => {
    return titleProjects.some(p => p.image_url || (p.video_urls && p.video_urls.length > 0));
  });

  if (visibleGroups.length === 0) return null;

  const isGraphics = category === 'Graphic Design';
  const isMotion = category === 'Motion';

  return (
    <>
      {visibleGroups.map(([title, titleProjects], groupIndex) => {
        // Collect all images and videos for this title
        const allImages: string[] = [];
        const allVideos: Array<{ url: string; platform: VideoPlatform; projectId: string; projectTitle: string }> = [];
        let titleDescription = '';
        let titleTools: string[] = [];

        titleProjects.forEach(project => {
          if (project.image_url) allImages.push(project.image_url);
          if (project.description && !titleDescription) titleDescription = project.description;
          if (project.tools && project.tools.length > 0 && titleTools.length === 0) titleTools = project.tools;
          const urls = project.video_urls || [];
          urls.forEach(url => {
            const platform = detectVideoPlatform(url);
            if (platform) {
              allVideos.push({ url, platform, projectId: project.id, projectTitle: project.title });
            }
          });
        });

        // ── Graphics: Composite Card ─────────────────────
        if (isGraphics && allImages.length > 0 && allVideos.length === 0) {
          return (
            <section key={title} className="section-padding relative overflow-visible bg-transparent" style={{ zIndex: 30 }}>
              <div className="section-container relative">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10 flex flex-col items-center">
                  <span className="section-subtitle">{category}</span>
                  <h2 className="section-title">{title}</h2>
                  <div className="section-divider" />
                </motion.div>
                <GraphicsCompositeCard
                  images={allImages}
                  title={title}
                  description={titleDescription}
                  tools={titleTools}
                />
              </div>
            </section>
          );
        }

        // ── Motion: Panel Layout ─────────────────────────
        if (isMotion) {
          return (
            <section key={title} className="section-padding relative overflow-visible bg-transparent" style={{ zIndex: 30 }}>
              <div className="section-container relative">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10 flex flex-col items-center">
                  <span className="section-subtitle">{category}</span>
                  <h2 className="section-title">{title}</h2>
                  <div className="section-divider" />
                </motion.div>
                <MotionPanel
                  title={title}
                  description={titleDescription}
                  tools={titleTools}
                  videoItems={allVideos}
                  imageItems={titleProjects.filter(p => p.image_url)}
                />
              </div>
            </section>
          );
        }

        // ── Photography & UI/UX: Alternating Hero Pattern ─
        const sectionKey = `${title}-${groupIndex}`;
        return (
          <section key={sectionKey} className="section-padding relative overflow-visible bg-transparent" style={{ zIndex: 30 }}>
            <div className="section-container relative">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10 flex flex-col items-center">
                <span className="section-subtitle">{category}</span>
                <h2 className="section-title">{title}</h2>
                <div className="section-divider" />
              </motion.div>
              <TitleGrid projects={titleProjects} categoryIndex={groupIndex} />
            </div>
          </section>
        );
      })}
    </>
  );
}
