import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight, Play, Loader2, X } from 'lucide-react';
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
    const filtered = activeCategory === 'All' 
      ? projects 
      : projects.filter(p => p.category === activeCategory);
    
    setFilteredProjects(filtered);
    
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

  return (
    <section id="works" className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
      
      {/* 1. DYNAMIC BACKGROUND (The Netflix Poster) */}
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
            {/* Cinematic Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 h-screen min-h-[700px] flex flex-col justify-between px-8 md:px-16 py-12">
        
        {/* 2. GENRE NAVIGATION (Top Bar) */}
        <div className="flex gap-6 md:gap-8 items-center pt-8 overflow-x-auto pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'text-white scale-110' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. HERO CONTENT (The Movie Info) */}
        <div className="max-w-3xl mb-12">
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={currentProject?.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-accent text-sm font-black tracking-[0.3em] uppercase block mb-4">
                  {currentProject?.category}
                </span>
                <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                  {currentProject?.title}
                </h1>
                <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-2xl">
                  {currentProject?.description || "Pushing the boundaries of creative excellence and innovative design."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedProject(currentProject)}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3 font-bold rounded hover:bg-white/80 transition-all"
                  >
                    <Play size={20} fill="black" /> View Project
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. UP NEXT RAIL (Bottom Swiper) */}
        <div className="w-full pb-8">
          <h2 className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Current Project
          </h2>
          
          {currentProject ? (
            <div className="relative">
              <div 
                onClick={() => setSelectedProject(currentProject)}
                className="relative aspect-video cursor-pointer transition-all duration-500 rounded-sm overflow-hidden border-2 border-accent shadow-[0_0_20px_var(--accent)] max-w-[240px] md:max-w-[320px]"
              >
                <img 
                  src={currentProject.image_url} 
                  className="w-full h-full object-cover" 
                  alt={currentProject.title} 
                />
              </div>
            </div>
          ) : (
            <div className="text-white/10 text-xs font-black uppercase tracking-[0.2em]">
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
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-lg"
            onClick={() => setSelectedProject(null)}
          >
            <button 
              type="button"
              onClick={() => setSelectedProject(null)} 
              className="absolute top-8 right-8 text-white hover:text-accent transition-colors z-[1001]"
            >
              <X size={40} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="border border-white/20 rounded-lg overflow-hidden">
                <img 
                  src={selectedProject.image_url} 
                  alt={selectedProject.title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
              <div className="text-left">
                <span className="text-accent text-xs font-black tracking-[0.4em] uppercase">
                  {selectedProject.category}
                </span>
                <h2 className="text-white text-5xl md:text-7xl font-black uppercase mt-4 leading-tight">
                  {selectedProject.title}
                </h2>
                <p className="text-white/60 mt-8 text-lg leading-relaxed font-light">
                  {selectedProject.description || "A stunning visual creation from our portfolio."}
                </p>
                <div className="mt-12 h-[1px] w-full bg-white/10" />
                <div className="mt-8">
                  <button 
                    type="button"
                    className="flex items-center gap-2 bg-accent text-black px-8 py-3 font-bold rounded hover:bg-accent/80 transition-all"
                  >
                    <Play size={20} fill="black" /> Explore Project
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
