import { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

// Swiper Styles - REQUIRED
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

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
        setFilteredProjects(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  useEffect(() => {
    const filtered = activeCategory === 'All' 
      ? projects 
      : projects.filter(p => p.category === activeCategory);
    setFilteredProjects(filtered);
    setActiveIndex(0); // Reset index on filter
  }, [activeCategory, projects]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedProject(null);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center bg-black">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="h-96 flex items-center justify-center text-red-500 font-black uppercase tracking-widest bg-black p-4 text-center">
      Database Error: {error}
    </div>
  );

  return (
    <section id="works" className="py-24 bg-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* CATEGORY PILLS */}
        <div className="flex flex-wrap gap-3 mb-16 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                activeCategory === cat 
                ? 'bg-accent border-accent text-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)]' 
                : 'border-white/10 text-white/40 hover:border-white/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SWIPER UI - Added key to force re-init on filter */}
        <Swiper
          key={activeCategory} 
          modules={[Navigation, Pagination, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={filteredProjects.length > 3}
          navigation={{
            nextEl: '.swiper-next',
            prevEl: '.swiper-prev',
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false,
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full !py-10"
        >
          {filteredProjects.map((project, idx) => (
            <SwiperSlide key={project.id} className="!w-[300px] sm:!w-[400px] aspect-[4/5]">
              <div 
                className={`relative w-full h-full border-2 transition-all duration-700 overflow-hidden cursor-pointer ${
                  activeIndex === idx 
                  ? 'border-accent shadow-[0_0_40px_rgba(var(--accent-rgb),0.2)] scale-105' 
                  : 'border-white/5 grayscale opacity-30 scale-90'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <img 
                  src={project.image_url} 
                  alt={project.title} 
                  className="w-full h-full object-cover pointer-events-none" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 p-6 md:p-8 w-full">
                  <span className="text-accent text-[8px] font-black tracking-widest uppercase">{project.category}</span>
                  <h3 className="text-white text-xl md:text-2xl font-black uppercase mt-2 truncate">{project.title}</h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* NAVIGATION CONTROLS */}
        <div className="flex justify-center gap-8 mt-12">
          <button className="swiper-prev p-4 border border-white/10 text-white hover:border-accent hover:text-accent transition-all rounded-full">
            <ChevronLeft size={24} />
          </button>
          <button className="swiper-next p-4 border border-white/10 text-white hover:border-accent hover:text-accent transition-all rounded-full">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* LIGHTBOX / MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl"
          >
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-50"
            >
              <X size={32} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="relative aspect-video lg:aspect-square overflow-hidden border border-white/10 bg-white/5">
                <img 
                  src={selectedProject.image_url} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="text-left">
                <span className="text-accent text-xs font-black tracking-[0.4em] uppercase">{selectedProject.category}</span>
                <h2 className="text-white text-4xl md:text-6xl font-black uppercase mt-4 leading-tight">{selectedProject.title}</h2>
                <p className="text-white/60 mt-6 text-base md:text-lg leading-relaxed font-light">{selectedProject.description || "Experimental visual design and execution."}</p>
                <div className="mt-10 flex gap-4">
                  <button className="bg-accent text-black px-8 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors">View Case Study</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
