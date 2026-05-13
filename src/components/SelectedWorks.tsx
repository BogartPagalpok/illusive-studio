import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

// FORCE LOAD CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

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
        .select('*');

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
    <div className="h-[60vh] flex flex-col items-center justify-center bg-black gap-6 border-y border-white/5">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
      <p className="text-white text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing Engine</p>
    </div>
  );

  if (error) return (
    <div className="h-96 flex flex-col items-center justify-center bg-black p-12 text-center border-2 border-red-900">
      <h2 className="text-red-500 font-black uppercase text-2xl mb-4 tracking-tighter">System Error</h2>
      <p className="text-white/40 text-xs font-mono mb-8 max-w-lg">{error}</p>
      <button 
        type="button"
        onClick={() => fetchWorks()} 
        className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest"
      >
        Force Re-Sync
      </button>
    </div>
  );

  return (
    <section id="works" className="py-24 bg-black overflow-hidden relative">
      <div className="section-container px-6">
        
        {/* CATEGORY SELECTOR */}
        <div className="flex flex-wrap gap-4 mb-16 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                activeCategory === cat 
                ? 'bg-accent border-accent text-black shadow-[0_0_20px_var(--accent)]' 
                : 'border-white/10 text-white/40 hover:text-white hover:border-white/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SWIPER COMPONENT */}
        {filteredProjects.length > 0 ? (
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            modules={[Navigation, Pagination, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={filteredProjects.length > 3}
            navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2, slideShadows: false }}
            pagination={{ clickable: true }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full !py-10"
          >
            {filteredProjects.map((project, idx) => (
              <SwiperSlide key={project.id} className="!w-[280px] sm:!w-[400px] aspect-[4/5]">
                <div 
                  className={`relative w-full h-full border-2 transition-all duration-700 overflow-hidden cursor-pointer ${
                    activeIndex === idx ? 'border-accent scale-105' : 'border-white/5 grayscale opacity-30 scale-90'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-0 p-8 w-full text-left">
                    <span className="text-accent text-[8px] font-black tracking-widest uppercase">{project.category}</span>
                    <h3 className="text-white text-2xl font-black uppercase mt-2 truncate">{project.title}</h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border border-white/5 border-dashed">
            <p className="text-white/10 text-[10px] font-black uppercase tracking-[1em]">Void Detected</p>
            <p className="text-white/5 text-[8px] mt-4 uppercase tracking-widest italic">Check DB Table: portfolio_projects</p>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-center gap-8 mt-12">
          <button type="button" className="swiper-prev p-4 border border-white/10 text-white hover:border-accent hover:text-accent transition-all rounded-full">
            <ChevronLeft size={24} />
          </button>
          <button type="button" className="swiper-next p-4 border border-white/10 text-white hover:border-accent hover:text-accent transition-all rounded-full">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl"
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
              className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="border border-white/10 bg-white/5">
                <img src={selectedProject.image_url} alt={selectedProject.title} className="w-full h-auto" />
              </div>
              <div className="text-left">
                <span className="text-accent text-xs font-black tracking-[0.4em] uppercase">{selectedProject.category}</span>
                <h2 className="text-white text-5xl md:text-7xl font-black uppercase mt-4 leading-tight">{selectedProject.title}</h2>
                <p className="text-white/60 mt-8 text-lg leading-relaxed font-light">{selectedProject.description || "Visual asset."}</p>
                <div className="mt-12 h-[1px] w-full bg-white/10" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
