import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Info, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description?: string;
}

const CATEGORIES = ['All', 'Graphic Design', 'Photography', 'UI/UX', 'Motion'];

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      console.log("SYSTEM: Initializing Supabase Fetch...");
      
      const { data, error: dbError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error("DATABASE REJECTION:", dbError);
        throw dbError;
      }

      if (!data || data.length === 0) {
        console.warn("SYSTEM: Connection established, but Table 'portfolio_projects' returned 0 rows.");
      } else {
        console.log(`SYSTEM: Successfully loaded ${data.length} projects.`);
      }

      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (err: any) {
      setError(err.message || "Unknown Connection Failure");
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
    
    // Grouping by name
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

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-6">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
      <p className="text-white text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing Engine</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black p-12 text-center">
      <h2 className="text-red-500 font-black uppercase text-2xl mb-4 tracking-tighter">System Error</h2>
      <p className="text-white/40 text-xs font-mono mb-8 max-w-lg">{error}</p>
      <button 
        type="button"
        onClick={() => fetchWorks()} 
        className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all"
      >
        Force Re-Sync
      </button>
    </div>
  );

  const currentProject = filteredProjects[activeIndex];
  
  // Get all images for the currently selected project in the modal
  const galleryImages = selectedProject 
    ? projects.filter(p => p.title.trim() === selectedProject.title.trim())
    : [];

  return (
    <section id="works" className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. DYNAMIC BACKGROUND */}
      <AnimatePresence mode="wait">
        {currentProject && (
          <motion.div
            key={currentProject?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={currentProject?.image_url} 
              className="w-full h-full object-cover opacity-50"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adjust mobile padding for better screen fit */}
      <div className="relative z-10 h-screen min-h-[700px] flex flex-col justify-between px-6 md:px-16 py-8 md:py-12">
        
        {/* 2. GENRE NAVIGATION */}
        <div className="flex gap-6 md:gap-8 items-center pt-0 mt-8 overflow-x-auto no-scrollbar pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'text-white scale-110' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO CONTENT */}
        <div className="max-w-3xl mb-8 md:mb-12">
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={currentProject?.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-accent text-[10px] md:text-sm font-black tracking-[0.3em] uppercase block mb-3 md:mb-4">
                  {currentProject?.category}
                </span>
                {/* RESPONSIVE FONT SIZE FIX */}
                <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
                  {currentProject?.title}
                </h1>
                {/* RESPONSIVE PARAGRAPH FIX */}
                <p className="text-white/70 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6 md:mb-8 max-w-2xl line-clamp-3 md:line-clamp-none">
                  {currentProject?.description || "Pushing the boundaries of creative excellence and innovative design."}
                </p>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedProject(currentProject)}
                    className="flex items-center gap-2 bg-white text-black px-6 py-2.5 md:px-8 md:py-3 text-[10px] md:text-xs font-bold rounded hover:bg-white/80 transition-all uppercase tracking-widest"
                  >
                    <Play size={16} fill="black" /> View Project
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedProject(currentProject)}
                    className="flex items-center gap-2 bg-white/5 border border-white/20 text-white px-6 py-2.5 md:px-8 md:py-3 text-[10px] md:text-xs font-bold rounded backdrop-blur-md shadow-lg hover:bg-white/10 transition-all uppercase tracking-widest"
                  >
                    <Info size={16} /> Details
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. UP NEXT RAIL */}
        <div className="w-full pb-4 md:pb-8">
          <h2 className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Up Next in Portfolio
          </h2>
          
          {filteredProjects.length > 0 ? (
            <>
              {/* MOBILE SWIPER FIX: observer and observeParents ensure full scrolling */}
              <Swiper
                onSwiper={(s) => (swiperRef.current = s)}
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={'auto'}
                observer={true}
                observeParents={true}
                watchSlidesProgress={true}
                navigation={{ nextEl: '.rail-next', prevEl: '.rail-prev' }}
                onSlideChange={(s) => setActiveIndex(s.realIndex)}
                className="overflow-visible"
              >
                {filteredProjects.map((project, idx) => (
                  <SwiperSlide key={project.id} className="!w-[140px] sm:!w-[180px] md:!w-[240px]">
                    <div 
                      onClick={() => swiperRef.current?.slideTo(idx)}
                      className={`relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 z-50 pointer-events-auto ${
                        activeIndex === idx 
                          ? 'border-accent scale-105 shadow-[0_0_20px_var(--accent)]' 
                          : 'border-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <img 
                        src={project.image_url} 
                        className="w-full h-full object-cover pointer-events-none" 
                        alt={project.title} 
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              <div className="flex gap-4 mt-4 md:mt-6">
                <button 
                  type="button"
                  className="rail-prev text-white/20 hover:text-white transition-colors cursor-pointer relative z-50"
                >
                  <ChevronLeft size={20} className="md:w-6 md:h-6" />
                </button>
                <button 
                  type="button"
                  className="rail-next text-white/20 hover:text-white transition-colors cursor-pointer relative z-50"
                >
                  <ChevronRight size={20} className="md:w-6 md:h-6" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
              No projects available
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl overflow-y-auto"
            onClick={() => setSelectedProject(null)}
          >
            <button 
              type="button"
              onClick={() => setSelectedProject(null)} 
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-accent transition-colors z-[1001]"
            >
              <X size={32} className="md:w-10 md:h-10" />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 md:gap-12 items-start my-auto pt-10 lg:pt-0"
            >
              {/* RESPONSIVE MODAL IMAGE CONTAINER: Shorter max height on mobile so text is reachable */}
              <div className="border border-white/20 rounded-lg overflow-hidden flex flex-col gap-4 max-h-[45vh] lg:max-h-[80vh] overflow-y-auto no-scrollbar">
                 {galleryImages.map((img) => (
                    <img 
                      key={img.id}
                      src={img.image_url} 
                      alt={img.title} 
                      className="w-full h-auto object-cover" 
                    />
                 ))}
              </div>
              
              <div className="text-left lg:sticky lg:top-0">
                <span className="text-accent text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">
                  {selectedProject.category}
                </span>
                {/* RESPONSIVE MODAL FONT FIX */}
                <h2 className="text-white text-3xl sm:text-4xl lg:text-6xl font-black uppercase mt-2 md:mt-4 leading-tight">
                  {selectedProject.title}
                </h2>
                <p className="text-white/60 mt-4 md:mt-8 text-sm md:text-lg leading-relaxed font-light">
                  {selectedProject.description || "A stunning visual creation from our portfolio."}
                </p>
                <div className="mt-8 md:mt-12 h-[1px] w-full bg-white/10" />
                <div className="mt-6 md:mt-8">
                  <button 
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="flex items-center gap-2 bg-accent text-black px-6 py-2.5 md:px-8 md:py-3 text-[10px] md:text-xs font-bold rounded hover:bg-accent/80 transition-all uppercase tracking-widest"
                  >
                    <Play size={16} fill="black" className="md:w-5 md:h-5" /> Close Project
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
