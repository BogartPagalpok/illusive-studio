import { useState, useEffect, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

// REQUIRED CSS
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // 1. Fetching logic wrapped in useCallback to satisfy linter
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (err: any) {
      console.error("Critical Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Filtering logic
  useEffect(() => {
    const result = activeCategory === 'All' 
      ? projects 
      : projects.filter(p => p.category === activeCategory);
    
    setFilteredProjects(result);
    
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 0);
      swiperRef.current.update();
    }
    setActiveIndex(0);
  }, [activeCategory, projects]);

  // 3. Modal escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) return (
    <div className="h-96 flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
    </div>
  );

  return (
    <section id="works" className="py-24 bg-black overflow-hidden relative">
      <div className="section-container">
        
        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-16 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                activeCategory === cat 
                ? 'bg-accent border-accent text-black' 
                : 'border-white/10 text-white/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SWIPER */}
        {filteredProjects.length > 0 && (
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[Navigation, Pagination, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={filteredProjects.length > 3}
            navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2, slideShadows: false }}
            pagination={{ clickable: true }}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            className="w-full !py-10"
          >
            {filteredProjects.map((project, idx) => (
              <SwiperSlide key={project.id} className="!w-[300px] sm:!w-[400px] aspect-[4/5]">
                <div 
                  className={`relative w-full h-full border-2 transition-all duration-500 cursor-pointer ${
                    activeIndex === idx ? 'border-accent scale-105' : 'border-white/5 grayscale opacity-30 scale-95'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 p-8 w-full text-left">
                    <p className="text-accent text-[8px] font-black uppercase tracking-widest">{project.category}</p>
                    <h3 className="text-white text-2xl font-black uppercase mt-1 truncate">{project.title}</h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* NAV */}
        <div className="flex justify-center gap-6 mt-8">
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
          >
            <button type="button" onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32} /></button>
            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
              <img src={selectedProject.image_url} alt={selectedProject.title} className="w-full border border-white/10" />
              <div className="text-left">
                <span className="text-accent text-xs font-black uppercase tracking-widest">{selectedProject.category}</span>
                <h2 className="text-white text-5xl font-black uppercase mt-4">{selectedProject.title}</h2>
                <p className="text-white/60 mt-6 text-lg font-light">{selectedProject.description || "Visual asset."}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
