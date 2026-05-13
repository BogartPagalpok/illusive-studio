import { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

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
        const { data, error: dbError } = await supabase
          .from('portfolio_projects') 
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;
        
        console.log(`Debug: Found ${data?.length || 0} projects in DB`);
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
  }, [activeCategory, projects]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedProject(null);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center bg-black gap-4">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Syncing Engine...</p>
    </div>
  );

  if (error) return (
    <div className="h-96 flex flex-col items-center justify-center bg-black p-8 text-center border border-red-500/20">
      <p className="text-red-500 font-black uppercase tracking-widest text-sm mb-2">Sync Failed</p>
      <p className="text-white/40 text-xs max-w-md mb-6">{error}</p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 border border-white/20 text-white text-[10px] font-black uppercase hover:border-accent hover:text-accent transition-all">
        Retry Sync
      </button>
    </div>
  );

  return (
    <section id="works" className="py-24 bg-black overflow-hidden relative">
      <div className="section-container">
        <div className="flex flex-wrap gap-4 mb-16 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                activeCategory === cat 
                ? 'bg-accent border-accent text-black shadow-[0_0_25px_rgba(var(--accent-rgb),0.5)]' 
                : 'border-white/10 text-white/40 hover:border-white/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProjects.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={filteredProjects.length > 3}
            navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5, slideShadows: true }}
            pagination={{ clickable: true }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full py-12"
          >
            {filteredProjects.map((project, idx) => (
              <SwiperSlide key={project.id} className="max-w-[400px] aspect-[4/5]">
                <div 
                  className={`relative w-full h-full border-2 transition-all duration-700 overflow-hidden cursor-pointer ${
                    activeIndex === idx ? 'border-accent shadow-[0_0_40px_rgba(var(--accent-rgb),0.4)] scale-105' : 'border-white/10 grayscale opacity-40 scale-95'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-0 p-8">
                    <span className="text-accent text-[8px] font-black tracking-widest uppercase">{project.category}</span>
                    <h3 className="text-white text-2xl font-black uppercase mt-2">{project.title}</h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-white/10 border border-white/5 border-dashed">
            <span className="uppercase font-black tracking-[0.4em] mb-2">Zero Assets Found</span>
            <span className="text-[10px] lowercase">Check database tables or RLS policies</span>
          </div>
        )}

        <div className="flex justify-center gap-6 mt-8">
          <button className="swiper-prev p-4 border border-white/10 hover:border-accent hover:text-accent transition-all text-white rounded-full">
            <ChevronLeft size={24} />
          </button>
          <button className="swiper-next p-4 border border-white/10 hover:border-accent hover:text-accent transition-all text-white rounded-full">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl"
          >
            <button onClick={() => setSelectedProject(null)} className="absolute top-10 right-10 text-white/50 hover:text-white z-50">
              <X size={40} />
            </button>
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border border-white/10 bg-white/5">
                <img src={selectedProject.image_url} alt={selectedProject.title} className="w-full h-auto object-cover" />
              </motion.div>
              <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <span className="text-accent text-xs font-black tracking-[0.4em] uppercase">{selectedProject.category}</span>
                <h2 className="text-white text-5xl md:text-7xl font-black uppercase mt-4 leading-none">{selectedProject.title}</h2>
                <p className="text-white/60 mt-8 text-lg leading-relaxed font-light">{selectedProject.description || "Visual asset."}</p>
                <button className="mt-12 bg-accent text-black px-10 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all">
                  Launch Case Study
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
