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
  video_url?: string;
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
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : url;
  }
  if (platform === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=0` : url;
  }
  return url;
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: '300px' }}>
      <div className="relative bg-zinc-900 rounded-[3rem] p-3 shadow-2xl border-4 border-zinc-700" style={{ aspectRatio: '9/16' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-zinc-900 rounded-b-2xl z-10" />
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-black">
          {children}
        </div>
      </div>
    </div>
  );
}

function MonitorFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: '600px' }}>
      <div className="relative bg-zinc-800 rounded-t-2xl p-3 shadow-2xl border-4 border-zinc-600 border-b-0">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rounded-full" />
        <div className="w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
          {children}
        </div>
      </div>
      <div className="mx-auto w-1/4 h-4 bg-zinc-700 rounded-b-lg" />
      <div className="mx-auto w-1/2 h-2 bg-zinc-600 rounded-b-lg" />
    </div>
  );
}

function FlipCard({ project }: { project: Project }) {
  const [selected, setSelected] = useState(false);

  return (
    <>
      <div className="flip-card cursor-pointer w-full" style={{ perspective: '1000px' }} onClick={() => setSelected(true)}>
        <div
          className="flip-card-inner relative w-full transition-all duration-500"
          style={{ transformStyle: 'preserve-3d', aspectRatio: 'auto' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateX(-90deg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotateX(0deg)'; }}
        >
          <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: 'var(--glass-border)' }}>
            <img src={project.hero_bg_desktop || project.image_url} alt={project.title} className="w-full h-auto object-contain" loading="lazy" />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-xs font-bold uppercase tracking-wider">{project.title}</p>
            </div>
          </div>
          <div
            className="absolute inset-0 w-full h-full rounded-xl overflow-hidden flex flex-col justify-end"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateX(90deg)', transformOrigin: 'bottom', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          >
            <div className="p-4">
              <h3 className="text-[var(--text-primary)] font-bold text-lg uppercase">{project.title}</h3>
              {project.description && <p className="text-[var(--text-secondary)] text-xs mt-1 line-clamp-3">{project.description}</p>}
              {project.tools && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.tools.slice(0, 3).map(t => (
                    <span key={t} className="px-2 py-0.5 text-[8px] uppercase tracking-wider rounded border" style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
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
        .order('created_at', { ascending: false });
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

  return (
    <section className="section-padding relative overflow-visible bg-transparent" style={{ zIndex: 30 }}>
      <div className="section-container relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10 flex flex-col items-center">
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title">{category}</h2>
          <div className="section-divider" />
        </motion.div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        )}

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {projects.map((project) => {
            const platform = project.video_url ? detectVideoPlatform(project.video_url) : null;
            const isVideo = !!platform;

            return (
              <div key={project.id} className="break-inside-avoid">
                {isVideo ? (
                  <div className="mb-3">
                    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
                      {platform === 'tiktok' ? (
                        <PhoneFrame>
                          <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 p-4">
                            <Play size={32} className="text-white/50 mb-2" />
                            <p className="text-white/70 text-xs text-center mb-3">{project.title}</p>
                            <a href={project.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs rounded-full font-bold hover:scale-105 transition-transform" onClick={(e) => e.stopPropagation()}>
                              <ExternalLink size={12} /> Watch on TikTok
                            </a>
                          </div>
                        </PhoneFrame>
                      ) : (
                        <MonitorFrame>
                          <iframe src={getVideoEmbedUrl(project.video_url!, platform)} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" title={project.title} />
                        </MonitorFrame>
                      )}
                      <div className="p-3">
                        <h3 className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-wider">{project.title}</h3>
                        {project.description && <p className="text-[var(--text-secondary)] text-[10px] mt-1 line-clamp-2">{project.description}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <FlipCard project={project} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
