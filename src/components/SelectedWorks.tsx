import { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Swiper Styles
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

  // 1. Fetch Data with Error Handling
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

  // 2. Genre Filtering Logic
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, projects]);

  // 3. Keyboard Navigation (Esc to close modal)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedProject(null);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) return (
    <div className="h-96 flex items-center justify-center bg-black">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="h-96 flex items-center justify-center text-red-500 font-bold uppercase tracking-widest">
      Error: {error}
    </div>
  );

  return (
    <section id="works" className="py-24 bg-black overflow-hidden">
      <div className="section-container">
        
        {/* CATEGORY / GENRE PILLS */}
        <div className="flex flex-wrap gap-4 mb-16 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                activeCategory === cat 
                ? 'bg-accent border-accent text-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]' 
                : 'border-white/10 text-white/40 hover:border-white/60 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SWIPER UI */}
        <Swiper
          modules={[Navigation, Pagination, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={filteredProjects.length > 3}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full py-12"
        >
          {filteredProjects.map((project, idx) => (
            <SwiperSlide key={project.id} className="max-w-[400px] aspect-[4/5]">
              <div 
                className={`relative w-full h-full border-2 transition-all duration-500 overflow-hidden cursor-pointer ${
                  activeIndex === idx ? 'border-accent shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]' : 'border-white/10 grayscale opacity-40'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <img 
                  src={project.image_url} 
                  alt={project.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-0 p-8">
                  <span className="text-accent text-[8px] font-black tracking-widest uppercase">{project.category}</span>
                  <h3 className="text-white text-2xl font-black uppercase mt-2">{project.title}</h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* NAVIGATION CONTROLS */}
        <div className="flex justify-center gap-6 mt-8">
          <button className="swiper-prev p-4 border border-white/10 hover:border-accent hover:text-accent transition-all">
            <ChevronLeft size={24} />
          </button>
          <button className="swiper-next p-4 border border-white/10 hover:border-accent hover:text-accent transition-all">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* LIGHTBOX / MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"
            >
              <X size={40} />
            </button>
            
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative group overflow-hidden border border-white/10">
                <img 
                  src={selectedProject.image_url} 
                  alt={selectedProject.title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
              <div>
                <span className="text-accent text-xs font-black tracking-[0.4em] uppercase">{selectedProject.category}</span>
                <h2 className="text-white text-5xl font-black uppercase mt-4 leading-none">{selectedProject.title}</h2>
                <p className="text-white/60 mt-6 text-lg leading-relaxed font-light">{selectedProject.description || "Project description coming soon."}</p>
                <button className="mt-10 btn-primary px-10 py-4">View Live Project</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
