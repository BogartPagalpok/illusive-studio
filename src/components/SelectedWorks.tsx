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
  const [modalIndex, setModalIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const trackX = useRef(0);
  const indexRef = useRef(0);
  const drag = useRef({ active: false, startX: 0, startTrackX: 0, lastX: 0, lastTime: 0, velocity: 0 });
  const animRef = useRef<number>(0);

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
    indexRef.current = 0;
    trackX.current = 0;
    renderImmediate();
  }, [activeCategory, projects]);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProject]);

  const count = filteredProjects.length;
  const slideWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth * 0.8 : 450;
  const slideHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth * 1.0 : 280;
  const gap = 16;
  const step = slideWidth + gap;
  const perspective = 1000;
  const maxRotateY = 45;
  const depth = 150;
  const activeScale = 1;
  const inactiveScale = 0.85;
  const inactiveOpacity = 0.5;

  const centerXFor = useCallback((i: number) => {
    const el = containerRef.current;
    if (!el) return -i * step;
    return el.offsetWidth / 2 - i * step - slideWidth / 2;
  }, [step, slideWidth]);

  const renderImmediate = useCallback(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    track.style.transform = `translateX(${trackX.current}px)`;
    const center = el.offsetWidth / 2;
    slidesRef.current.forEach((slide, i) => {
      if (!slide) return;
      const slideCenter = i * step + slideWidth / 2 + trackX.current;
      const norm = (slideCenter - center) / step;
      const abs = Math.abs(norm);
      const ry = norm * maxRotateY;
      const tz = -abs * depth;
      const sc = Math.max(inactiveScale, activeScale - abs * (activeScale - inactiveScale));
      const op = Math.max(inactiveOpacity, 1 - abs * (1 - inactiveOpacity));
      slide.style.transform = `perspective(${perspective}px) rotateY(${ry}deg) translateZ(${tz}px) scale(${sc})`;
      slide.style.opacity = `${op}`;
      slide.style.zIndex = `${100 - Math.round(abs * 10)}`;
    });
  }, [step, slideWidth, maxRotateY, depth, activeScale, inactiveScale, inactiveOpacity, perspective]);

  const animateTo = useCallback((targetX: number) => {
    const startX = trackX.current;
    const startTime = performance.now();
    const duration = 600;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      trackX.current = startX + (targetX - startX) * ease(progress);
      renderImmediate();
      if (progress < 1) animRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);
  }, [renderImmediate]);

  const snapTo = useCallback((i: number) => {
    const target = Math.max(0, Math.min(count - 1, i));
    indexRef.current = target;
    setActiveIndex(target);
    animateTo(centerXFor(target));
  }, [centerXFor, count, animateTo]);

  useEffect(() => {
    slidesRef.current = slidesRef.current.slice(0, count);
    snapTo(0);
  }, [count]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onStart = (clientX: number) => {
      cancelAnimationFrame(animRef.current);
      drag.current.active = true;
      drag.current.startX = clientX;
      drag.current.startTrackX = trackX.current;
      drag.current.lastX = clientX;
      drag.current.lastTime = Date.now();
      drag.current.velocity = 0;
    };
    const onMove = (clientX: number) => {
      if (!drag.current.active) return;
      const now = Date.now();
      const dt = now - drag.current.lastTime;
      if (dt > 0) drag.current.velocity = ((clientX - drag.current.lastX) / dt) * 1000;
      drag.current.lastX = clientX;
      drag.current.lastTime = now;
      trackX.current = drag.current.startTrackX + (clientX - drag.current.startX);
      renderImmediate();
    };
    const onEnd = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      const projected = trackX.current + drag.current.velocity * 0.12;
      const center = container.offsetWidth / 2;
      let best = 0, bestDist = Infinity;
      for (let i = 0; i < count; i++) {
        const sc = i * step + slideWidth / 2 + projected;
        const d = Math.abs(sc - center);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      snapTo(best);
    };
    const handleMouseDown = (e: MouseEvent) => { e.preventDefault(); onStart(e.clientX); };
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const handleMouseUp = () => onEnd();
    const handleTouchStart = (e: TouchEvent) => onStart(e.touches[0].clientX);
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); onMove(e.touches[0].clientX); };
    const handleTouchEnd = () => onEnd();
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [count, step, slideWidth, renderImmediate, snapTo]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  const galleryImages = selectedProject
    ? projects.filter(p => p.title.trim() === selectedProject.title.trim())
    : [];

  return (
    <section id="works" className="relative py-16 lg:py-20 overflow-visible z-40 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-8 flex flex-col items-center">
          <span className="section-subtitle">Portfolio</span>
          <h2 className="section-title">Selected Works</h2>
          <div className="section-divider" />
        </motion.div>

        <div className="flex gap-3 md:gap-4 items-center overflow-x-auto no-scrollbar mb-6 justify-center">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap px-3 py-1.5 rounded-full border ${activeCategory === cat ? 'text-accent border-accent bg-accent/10' : 'text-[var(--text-primary)]/40 border-transparent hover:text-[var(--text-primary)] hover:border-[var(--glass-border)]'}`}>{cat}</button>
          ))}
        </div>

        <div ref={containerRef} className="w-full overflow-hidden flex items-center cursor-grab active:cursor-grabbing select-none relative" style={{ height: slideHeight + 100, perspective: `${perspective}px` }}>
          <div ref={trackRef} className="flex items-center" style={{ gap: `${gap}px` }}>
            {filteredProjects.map((project, i) => (
              <div key={project.id} ref={el => { slidesRef.current[i] = el; }} className="flex-shrink-0 will-change-transform rounded-[20px] overflow-hidden cursor-pointer" style={{ width: slideWidth, height: slideHeight }} onClick={() => { setSelectedProject(project); setModalIndex(0); }} onMouseDown={(e) => e.stopPropagation()}>
                <GlowCard glowColor="var(--accent)" glowSize={120} glowIntensity={0.06} borderRadius="20px">
                  <div className="relative rounded-[20px] overflow-hidden border flex flex-col h-full" style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
                    <div className="flex-1 overflow-hidden">
                      <img src={project.hero_bg_desktop || project.image_url} className="w-full h-full object-cover" alt={project.title} draggable={false} />
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-shrink-0">
                      <span className="text-accent text-[8px] font-bold tracking-[0.2em] uppercase">{project.category}</span>
                      <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-tighter leading-tight">{project.title}</h3>
                      <p className="text-[var(--text-secondary)] text-[10px] leading-relaxed line-clamp-1">{project.description}</p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-5">
          {filteredProjects.map((_, idx) => (
            <button key={idx} onClick={() => snapTo(idx)} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-accent scale-125' : 'bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* Modal — Clean Focus Slice */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}>
            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-[10000] p-2.5 rounded-full border transition-all" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}>
              <X size={18} />
            </button>

            <div className="flex-1 flex items-center justify-center min-h-0 px-6 pt-16 pb-6">
              <div className="flex gap-2.5 w-full max-w-4xl items-stretch" style={{ height: 'clamp(280px, 50vh, 480px)' }}>
                {galleryImages.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => setModalIndex(idx)}
                    className="relative cursor-pointer overflow-hidden flex-shrink-0 transition-all duration-500 ease-in-out"
                    style={{
                      width: idx === modalIndex ? '58%' : '7%',
                      borderRadius: idx === modalIndex ? 16 : 9999,
                    }}
                  >
                    <img src={img.hero_bg_desktop || img.image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6 flex items-center justify-between gap-4 max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-accent text-[9px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">{selectedProject.category}</span>
                <span className="text-[var(--text-primary)]/20 text-[9px]">|</span>
                <h2 className="text-[var(--text-primary)] text-xs font-black uppercase tracking-tighter truncate">{selectedProject.title}</h2>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex gap-1">
                  {galleryImages.map((_, idx) => (
                    <button key={idx} onClick={() => setModalIndex(idx)} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === modalIndex ? 'bg-accent scale-125' : 'bg-white/20 hover:bg-white/40'}`} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
