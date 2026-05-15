import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Play, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/navigation';

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

const CATEGORIES = ['All', 'Graphic Design', 'Photography', 'UI/UX', 'Motion'];

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

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedProject]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-6">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  const currentProject = filteredProjects[activeIndex];
  const galleryImages = selectedProject 
    ? projects.filter(p => p.title.trim() === selectedProject.title.trim())
    : [];

  return (
    <section id="works" className="relative w-full bg-black overflow-x-hidden font-sans">
      
      {/* MOBILE RESPONSIVE TITLE BRIDGE */}
      <div className="relative z-50 w-full text-center pt-16 md:pt-24 pb-6 md:pb-12">
        <p className="text-[10px] md:text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
          Portfolio
        </p>
        <h2 className="font-bold tracking-tighter text-3xl md:text-5xl lg:text-6xl uppercase" style={{ color: '#ffffff' }}>
          Selected Works
        </h2>
        <div className="mt-4 md:mt-6 w-16 md:w-20 h-0.5 bg-accent mx-auto" />
      </div>

      <div className="relative w-full min-h-[70vh] md:min-h-screen flex flex-col">
        {/* BACKGROUND LAYER */}
        <AnimatePresence mode="wait">
          {currentProject && (
            <motion.div
              key={currentProject.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={currentProject.hero_bg_mobile || currentProject.image_url || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} 
                className="w-full h-full object-cover md:hidden" 
                alt="bg mobile" 
              />
              <img 
                src={currentProject.hero_bg_desktop || currentProject.image_url || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} 
                className="hidden md:block w-full h-full object-cover" 
                alt="bg desktop" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 md:via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTENT LAYER - Adjusted padding for mobile */}
        <div className="relative z-10 flex flex-col px-6 md:px-16 pt-4 pb-12 flex-1">
          
          <div className="flex gap-4 md:gap-8 items-center overflow-x-auto no-scrollbar pb-6 shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'text-white scale-110' : 'text-white/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col w-full pt-10 md:pt-0">
            <div className="max-w-3xl mb-8 md:mb-12">
              <AnimatePresence mode="wait">
                {currentProject && (
                  <motion.div
                    key={currentProject.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-accent text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase block mb-3 md:mb-4">
                      {currentProject.category}
                    </span>
                    <h1 className="text-white text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none mb-4 md:mb-6 line-clamp-2">
                      {currentProject.title}
                    </h1>
                    <p className="text-white/70 text-xs md:text-base leading-relaxed mb-6 md:mb-10 max-w-2xl line-clamp-3">
                      {currentProject.description}
                    </p>
                    <button 
                      type="button"
                      onClick={() => setSelectedProject(currentProject)}
                      className="flex items-center gap-3 bg-accent text-black px-8 md:px-10 py-3 text-[10px] md:text-xs font-bold rounded-2xl hover:drop-shadow-[0_0_20px_var(--accent)] transition-all uppercase tracking-widest"
                    >
                      <Play size={14} fill="black" /> View Project
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-full relative z-50">
              <h2 className="text-white/40 text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Up Next
              </h2>
              
              <div className="relative w-full">
                <Swiper
                  onSwiper={(s) => (swiperRef.current = s)}
                  modules={[Navigation]}
                  spaceBetween={12}
                  slidesPerView={'auto'}
                  slidesOffsetAfter={100}
                  observer={true}
                  observeParents={true}
                  watchSlidesProgress={true}
                  onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                  className="overflow-visible"
                >
                  {filteredProjects.map((project, idx) => (
                    <SwiperSlide key={project.id} className="!w-[130px] sm:!w-[180px] md:!w-[240px]">
                      <div 
                        onClick={() => {
                          setActiveIndex(idx);
                          swiperRef.current?.slideTo(idx);
                        }}
                        className={`relative aspect-video bg-white/5 cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 z-[60] flex items-center justify-center ${
                          activeIndex === idx ? 'border-accent scale-105 shadow-[0_0_15px_var(--accent)]' : 'border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                        }`}
                      >
                        {(project.card_thumbnail || project.image_url) ? (
                          <img 
                            src={project.card_thumbnail || project.image_url} 
                            className="w-full h-full object-cover pointer-events-none" 
                            alt={project.title} 
                          />
                        ) : (
                          <span className="text-white/20 text-[10px]">No Image</span>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <button 
              type="button" 
              onClick={() => setSelectedProject(null)} 
              className="fixed top-6 right-6 text-white hover:text-accent transition-colors z-[10000] bg-white/5 p-2 rounded-xl backdrop-blur-md border border-white/10"
            >
              <X size={20} />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-6 md:gap-12 items-start my-auto mt-20 lg:mt-auto bg-white/5 border border-white/10 backdrop-blur-2xl p-6 md:p-10 rounded-2xl shadow-2xl"
            >
              <div className="border border-white/10 rounded-xl overflow-hidden flex flex-col gap-4 max-h-[40vh] lg:max-h-[75vh] overflow-y-auto no-scrollbar bg-white/5 p-2">
                 {galleryImages.map((img) => (
                    <img 
                      key={img.id} 
                      src={img.hero_bg_desktop || img.image_url || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} 
                      alt="project" 
                      className="w-full h-auto object-cover rounded-lg shadow-lg" 
                    />
                 ))}
              </div>
              <div className="text-left flex flex-col gap-5 md:gap-8 max-h-[45vh] lg:max-h-[75vh] overflow-y-auto no-scrollbar pr-2">
                <div>
                  <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase">{selectedProject.category}</span>
                  <h2 className="text-white text-2xl md:text-5xl font-bold uppercase mt-2 leading-tight">{selectedProject.title}</h2>
                  <p className="text-white/70 mt-4 text-xs md:text-base leading-relaxed">{selectedProject.description}</p>
                </div>

                {selectedProject.tools && Array.isArray(selectedProject.tools) && selectedProject.tools.length > 0 && (
                  <div>
                    <h3 className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tools.map((tool, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] text-white/80 backdrop-blur-md">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.process && (
                  <div>
                    <h3 className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Process</h3>
                    <p className="text-white/70 text-xs md:text-base leading-relaxed whitespace-pre-wrap">{selectedProject.process}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
}
