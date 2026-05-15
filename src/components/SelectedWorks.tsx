import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/navigation';

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
  process?: string;
  tools?: string[];
  results?: string;
  featured?: boolean;
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

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

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

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
    
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
      swiperRef.current.update();
    }
    setActiveIndex(0);
  }, [activeCategory, projects]);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [selectedProject]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-transparent gap-6">
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
          className="text-center mb-8"
        >
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
            Portfolio
          </p>
          <h2 className="font-bold tracking-tighter heading-lg text-primary uppercase">
            Selected Works
          </h2>
          <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
        </motion.div>

        <div className="relative w-full rounded-[40px] overflow-hidden bg-surface border border-border flex flex-col h-[clamp(550px,75vh,850px)]">
          
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={currentProject.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-0 pointer-events-none"
              >
                <img 
                  src={currentProject.hero_bg_desktop || currentProject.image_url} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 p-8 md:p-14 flex flex-col h-full">
            <div className="flex gap-4 md:gap-8 items-center overflow-x-auto no-scrollbar mb-6 shrink-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat ? 'text-primary scale-110' : 'text-primary/40 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="max-w-2xl w-full flex-1 flex flex-col justify-center min-h-0">
              <AnimatePresence mode="wait">
                {currentProject && (
                  <motion.div
                    key={currentProject.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-y-auto no-scrollbar"
                  >
                    <span className="text-accent text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase block mb-3">
                      {currentProject.category}
                    </span>
                    <h3 className="text-primary text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-none mb-4 break-words">
                      {currentProject.title}
                    </h3>
                    <p className="text-secondary text-sm md:text-base leading-relaxed mb-8 max-w-xl line-clamp-4">
                      {currentProject.description}
                    </p>
                    {/* FIXED: Using explicit contrast color and relative z-index for the button text */}
                    <button 
                      onClick={() => setSelectedProject(currentProject)}
                      className="relative z-50 inline-flex items-center gap-4 bg-accent px-10 py-4 rounded-full transition-all hover:drop-shadow-[0_0_20px_var(--accent)] group"
                    >
                      <Play size={16} className="text-black fill-black group-hover:scale-110 transition-transform" />
                      <span className="text-black text-xs font-black uppercase tracking-widest">
                        View Project
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 w-full shrink-0">
              <h4 className="text-primary/40 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Up Next</h4>
              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={'auto'}
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                className="overflow-visible"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[140px] md:!w-[200px]">
                    <div 
                      onClick={() => {
                        setActiveIndex(idx);
                        swiperRef.current?.slideTo(idx);
                      }}
                      className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-xl overflow-hidden border-2 ${
                        activeIndex === idx ? 'border-accent shadow-[0_0_15px_var(--accent)]' : 'border-border grayscale opacity-50 hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <img src={project.card_thumbnail || project.image_url} className="w-full h-full object-cover" alt="" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-background/80 backdrop-blur-2xl overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <button onClick={() => setSelectedProject(null)} className="fixed top-8 right-8 text-primary bg-surface p-4 rounded-full border border-border hover:bg-accent transition-colors"><X size={24} /></button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 bg-surface border border-border p-8 rounded-[40px] shadow-2xl"
            >
              <div className="rounded-[24px] overflow-hidden space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar bg-background p-2 border border-border">
                 {galleryImages.map((img) => (
                    <img key={img.id} src={img.hero_bg_desktop || img.image_url} className="w-full rounded-[16px]" alt="" />
                 ))}
              </div>
              <div className="space-y-6 text-left">
                <div>
                  <span className="text-accent text-xs font-black tracking-[0.4em] uppercase">{selectedProject.category}</span>
                  <h2 className="text-primary text-4xl font-bold uppercase mt-2 tracking-tighter leading-tight">{selectedProject.title}</h2>
                  <p className="text-secondary text-base leading-relaxed mt-4">{selectedProject.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tools?.map((t: string) => (
                    <span key={t} className="px-4 py-2 bg-background border border-border rounded-lg text-[10px] uppercase text-secondary font-bold tracking-widest">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
}
