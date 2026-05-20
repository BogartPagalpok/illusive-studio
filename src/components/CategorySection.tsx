import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Play, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VideoEntry {
  url: string;
  vertical: boolean;
}

interface Project {
  id: string;
  title: string;
  category: string;
  description?: string;
  image_url: string;
  video_urls?: VideoEntry[] | string[];
  tools?: string[];
  hero_bg_desktop?: string;
  hero_bg_mobile?: string;
  card_thumbnail?: string;
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
    <div className="relative w-full" style={{ aspectRatio: '9/16', maxWidth: '320px', margin: '0 auto' }}>
      <div className="relative w-full h-full bg-zinc-900 rounded-[2rem] p-2 shadow-2xl border-2 border-zinc-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-5 bg-zinc-900 rounded-b-xl z-10" />
        <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-black">
          {children}
        </div>
      </div>
    </div>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      <style>{`
        .browser-card { width: 100%; height: 100%; background: #1a1a1a; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 2px 5px 15px rgba(0, 0, 0, 0.486); border: 1px solid rgb(40, 40, 40); }
        .browser-top { height: 32px; display: flex; align-items: center; padding: 0 12px; gap: 8px; background: #1a1a1a; flex-shrink: 0; }
        .browser-dots { display: flex; gap: 6px; }
        .browser-dot { width: 10px; height: 10px; border-radius: 50%; }
        .browser-dot.red { background: #ff5f56; } .browser-dot.yellow { background: #ffbd2e; } .browser-dot.green { background: #27c93f; }
        .browser-search { flex: 1; height: 22px; border-radius: 4px; background: #111; display: flex; align-items: center; padding: 0 10px; font-size: 10px; color: #555; margin-left: 8px; }
        .browser-content { flex: 1; background: black; overflow: hidden; }
      `}</style>
      <div className="browser-card">
        <div className="browser-top">
          <div className="browser-dots">
            <div className="browser-dot red" /><div className="browser-dot yellow" /><div className="browser-dot green" />
          </div>
          <div className="browser-search">iframe</div>
        </div>
        <div className="browser-content">{children}</div>
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
          <div
            className="flip-card-front relative w-full rounded-xl overflow-hidden border"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderColor: 'var(--glass-border)',
              backgroundColor: 'var(--bg-primary)',
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
                  <div key={i} className="cursor-pointer overflow-hidden aspect-square" onClick={(e) => handleImageClick(e, i)}>
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
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-xs font-bold uppercase tracking-wider">{title}</p>
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

function MotionPanel({ title, description, tools, videoItems }: { title: string; description?: string; tools?: string[]; videoItems: Array<{ url: string; platform: VideoPlatform; projectId: string; projectTitle: string; vertical: boolean }> }) {
  return (
  <div className="flex flex-col lg:flex-row gap-6">
     <div className="lg:w-1/4 flex flex-col justify-start p-6 rounded-xl border backdrop-blur-xl overflow-y-auto no-scrollbar" style={{ maxHeight: '80vh', overscrollBehavior: 'contain', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
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
      <div className="lg:w-3/4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoItems.map((item, i) => {
            const usePhone = item.platform === 'tiktok' || item.vertical || (item.platform === 'youtube' && isShort(item.url));
            return (
              <div key={`${item.projectId}-${i}`}>
                {usePhone ? (
                  <PhoneFrame>
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
                  </PhoneFrame>
                ) : (
                  <BrowserFrame>
                    <iframe
                      src={getVideoEmbedUrl(item.url, item.platform!)}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                      title={item.projectTitle}
                    />
                  </BrowserFrame>
                )}
                <p className="text-center text-[10px] font-heading font-bold uppercase tracking-wider mt-2" style={{ color: 'var(--text-primary)' }}>{item.projectTitle}</p>
              </div>
            );
          })}
        </div>
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

  const groupedByTitle = projects.reduce((acc, project) => {
    const title = project.title || 'Untitled';
    if (!acc[title]) acc[title] = [];
    acc[title].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

    const visibleGroups = Object.entries(groupedByTitle).filter(([_, titleProjects]) => {
    return titleProjects.some(p => 
      p.image_url || 
      (p.video_urls && p.video_urls.length > 0 && p.video_urls.some((entry: any) => {
        const url = getUrl(entry);
        return url && url.trim().length > 0;
      }))
    );
  });

  if (visibleGroups.length === 0) return null;

  const isGraphics = category === 'Graphic Design';
  const isMotion = category === 'Motion';

  const getVideoUrl = (project: Project): string | null => {
    if (project.video_urls && project.video_urls.length > 0) {
      const first = project.video_urls[0];
      return getUrl(first);
    }
    if ((project as any).video_url) return (project as any).video_url;
    return null;
  };

  return (
    <>
      {visibleGroups.map(([title, titleProjects]) => {
        // ── Graphics: Composite Card ─────────────────────
        if (isGraphics) {
          const allImages: string[] = [];
          let titleDescription = '';
          let titleTools: string[] = [];

          titleProjects.forEach(project => {
            if (project.image_url) allImages.push(project.image_url);
            if (project.description && !titleDescription) titleDescription = project.description;
            if (project.tools && project.tools.length > 0 && titleTools.length === 0) titleTools = project.tools;
          });

          if (allImages.length === 0) return null;

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
          const allVideos: Array<{ url: string; platform: VideoPlatform; projectId: string; projectTitle: string; vertical: boolean }> = [];
          let titleDescription = '';
          let titleTools: string[] = [];

          titleProjects.forEach(project => {
            if (project.description && !titleDescription) titleDescription = project.description;
            if (project.tools && project.tools.length > 0 && titleTools.length === 0) titleTools = project.tools;
            const urls = project.video_urls || [];
            urls.forEach(entry => {
              const url = getUrl(entry);
              const vertical = getVertical(entry);
              const platform = detectVideoPlatform(url);
              if (platform) {
                allVideos.push({ url, platform, projectId: project.id, projectTitle: project.title, vertical });
              }
            });
          });

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
                />
              </div>
            </section>
          );
        }

        // ── Photography & UI/UX: Original masonry ────────
        const hasGap = titleProjects.length % columnCount !== 0;
        const lastIndex = titleProjects.length - 1;

        return (
          <section key={title} className="section-padding relative overflow-visible bg-transparent" style={{ zIndex: 30 }}>
            <div className="section-container relative">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10 flex flex-col items-center">
                <span className="section-subtitle">{category}</span>
                <h2 className="section-title">{title}</h2>
                <div className="section-divider" />
              </motion.div>

              {loading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
              )}

              <div className="columns-1 md:columns-2 lg:columns-4 gap-4 space-y-4">
                {titleProjects.map((project, index) => {
                  const videoUrl = getVideoUrl(project);
                  const platform = videoUrl ? detectVideoPlatform(videoUrl) : null;
                  const isVideo = !!platform;
                  const isLast = index === lastIndex;
                  const isHero = hasGap && isLast && !isVideo;

                  return (
                    <div key={project.id} className="break-inside-avoid">
                      {isVideo ? (
                        <div className="mb-3">
                          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
                            <PhoneFrame>
                              {platform === 'tiktok' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 p-4">
                                  <Play size={32} className="text-white/50 mb-2" />
                                  <p className="text-white/70 text-xs text-center mb-3">{project.title}</p>
                                  <a href={videoUrl!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs rounded-full font-bold hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}>
                                    <ExternalLink size={12} /> Watch on TikTok
                                  </a>
                                </div>
                              ) : (
                                <iframe
                                  src={getVideoEmbedUrl(videoUrl!, platform)}
                                  className="w-full h-full"
                                  allowFullScreen
                                  allow="autoplay; encrypted-media"
                                  title={project.title}
                                />
                              )}
                            </PhoneFrame>
                            <div className="p-3">
                              <h3 className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-wider">{project.title}</h3>
                              {project.description && <p className="text-[var(--text-secondary)] text-[10px] mt-1 line-clamp-2">{project.description}</p>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <FlipCard project={project} isHero={isHero} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
