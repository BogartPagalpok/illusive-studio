import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import GlowCard from './GlowCard';

const CATEGORIES = ['All', 'Graphic Design', 'Photography', 'UI/UX', 'Motion'];

interface Project {
  id: string;
  title: string;
  category: string;
  description?: string;
  card_thumbnail?: string;
  hero_bg_desktop?: string;
  hero_bg_mobile?: string;
  image_url: string;
  tools?: string[];
  process?: string;
  results?: string;
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbError) throw dbError;
      setProjects(data || []);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  useEffect(() => {
    const categoryFiltered = activeCategory === 'All'
      ? projects
      : projects.filter(p => p.category === activeCategory);
    const uniqueProjects: Project[] = [];
    const seenTitles = new Set<string>();
    categoryFiltered.forEach(p => {
      const cleanTitle = p.title.trim();
      if (!seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        uniqueProjects.push(p);
      }
    });
    setFilteredProjects(uniqueProjects);
    setActiveIndex(0);
    setExpanded(false);
  }, [activeCategory, projects]);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProject]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold && activeIndex < filteredProjects.length - 1) {
      setActiveIndex(prev => prev + 1);
      setExpanded(false);
    } else if (diff < -threshold && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setExpanded(false);
    }
  };

  const mouseStartX = useRef(0);
  const handleMouseDown = (e: React.MouseEvent) => { mouseStartX.current = e.clientX; };
  const handleMouseUp = (e: React.MouseEvent) => {
    const diff = mouseStartX.current - e.clientX;
    const threshold = 50;
    if (diff > threshold && activeIndex < filteredProjects.length - 1) {
      setActiveIndex(prev => prev + 1);
      setExpanded(false);
    } else if (diff < -threshold && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setExpanded(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedProject) return;
      if (e.key === 'ArrowLeft' && activeIndex > 0) { setActiveIndex(prev => prev - 1); setExpanded(false); }
      if (e.key === 'ArrowRight' && activeIndex < filteredProjects.length - 1) { setActiveIndex(prev => prev + 1); setExpanded(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, filteredProjects.length, selectedProject]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  const currentProject = filteredProjects[activeIndex];
  const galleryImages = selectedProject
    ? projects.filter(p => p.title.trim() === selectedProject.title.trim())
    : [];

  return (
    <section id="works" className="relative section-padding overflow-visible z-40 bg-transparent">
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 flex flex-col items-center"
        >
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title">Selected Works</h2>
          <div className="section-divider" />
        </motion.div>

        <div className="flex gap-4 md:gap-6 items-center overflow-x-auto no-scrollbar mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap px-4 py-2 rounded-full border ${
                activeCategory === cat
                  ? 'text-accent border-accent bg-accent/10'
                  : 'text-[var(--text-primary)]/40 border-transparent hover:text-[var(--text-primary)] hover:border-[var(--glass-border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {currentProject && (
          <GlowCard
            className="w-full max-w-4xl mx-auto"
            glowColor="var(--accent)"
            glowSize={350}
            glowIntensity={0.12}
            borderRadius="32px"
          >
            <div
              ref={containerRef}
              className="relative w-full rounded-[32px] overflow-hidden border select-none"
              style={{
                backgroundColor: 'var(--glass-bg)',
                borderColor: 'var(--glass-border)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
                aspectRatio: isMobile ? '4/5' : '16/9',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{ bottom: expanded ? '30%' : '15%' }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentProject.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={isMobile ? (currentProject.hero_bg_mobile || currentProject.image_url) : (currentProject.hero_bg_desktop || currentProject.image_url)}
                    className="w-full h-full object-cover object-center"
                    alt={currentProject.title}
                    draggable={false}
                  />
                </AnimatePresence>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 border-t cursor-pointer transition-all duration-400"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)',
                  backdropFilter: 'blur(20px)',
                  height: expanded ? '30%' : '15%',
                  overflow: 'hidden',
                }}
                onClick={() => setExpanded(!expanded)}
              >
                <div className="p-4 md:p-5 flex flex-col h-full">
                  <div className="flex items-center justify-between flex-none">
                    <h3 className="text-[var(--text-primary)] text-lg md:text-xl font-black uppercase tracking-tighter truncate">
                      {currentProject.title}
                    </h3>
                    <div className="flex gap-1.5">
                      {filteredProjects.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === activeIndex ? 'bg-accent scale-125' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-1 overflow-y-auto no-scrollbar mt-3"
                    >
                      <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase block mb-2">
                        {currentProject.category}
                      </span>
                      <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed">
                        {currentProject.description}
                      </p>
                      {currentProject.tools && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {currentProject.tools.map(t => (
                            <span key={t} className="px-2 py-1 bg-white/5 border border-[var(--glass-border)] rounded-md text-[8px] uppercase text-[var(--text-secondary)] font-bold tracking-widest">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedProject(currentProject); }}
                        className="btn-primary-sm mt-3"
                      >
                        View Full Project
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </GlowCard>
        )}

        <div className="flex justify-center gap-2 mt-6">
          {filteredProjects.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveIndex(idx); setExpanded(false); }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'bg-accent scale-125' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}
            onClick={() => setSelectedProject(null)}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="fixed top-6 right-6 z-[10000] p-3 rounded-full border transition-all shadow-xl"
              style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-3 gap-6 p-6 md:p-10 rounded-[32px] shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar border"
              style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(20px)' }}
            >
              <div className="lg:col-span-2 w-full">
                <div className="grid gap-4">
                  {galleryImages.map((img) => (
                    <img
                      key={img.id}
                      src={img.hero_bg_desktop || img.image_url}
                      className="w-full h-auto max-h-[60vh] rounded-[20px] border object-cover object-center"
                      style={{ borderColor: 'var(--glass-border)' }}
                      alt=""
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-accent text-[10px] font-bold tracking-[0.4em] uppercase mb-2 block">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-[var(--text-primary)] text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-2">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.tools && selectedProject.tools.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tools.map((t) => (
                        <span key={t} className="px-4 py-2 border rounded-lg text-[9px] uppercase font-bold tracking-widest transition-colors" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.process && (
                  <div>
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Process</h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedProject.process}</p>
                  </div>
                )}

                {selectedProject.results && (
                  <div>
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--text-primary)]/60 mb-2">Results</h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedProject.results}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
