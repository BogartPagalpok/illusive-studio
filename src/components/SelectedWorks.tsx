import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Project {
  id: string;
  title: string;
  category: string;
  image_url: string;
  all_images?: string[];
  overview?: string;
  description?: string;
  workflow?: string;
  tech_stack?: string;
  tools?: string[];
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      (nav as HTMLElement).style.opacity = '0';
      (nav as HTMLElement).style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = 'unset';
      (nav as HTMLElement).style.opacity = '1';
      (nav as HTMLElement).style.pointerEvents = 'auto';
    }
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Fetch Error:", error.message);
        return;
      }

      if (data) {
        const grouped: Record<string, Project> = {};
        data.forEach((item: any) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, '').trim();
          if (!grouped[cleanTitle]) {
            grouped[cleanTitle] = { 
              ...item, 
              title: cleanTitle, 
              all_images: [item.image_url],
              tools: item.tech_stack ? item.tech_stack.split(',').map((t: string) => t.trim()) : []
            };
          } else {
            grouped[cleanTitle].all_images?.push(item.image_url);
          }
        });
        setProjects(Object.values(grouped));
      }
    };
    fetchData();
  }, []);

  return (
    <section id="works" className="relative z-10 bg-transparent min-h-screen py-10 md:py-20 overflow-hidden flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-6 md:mb-12">
          <p className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-accent mb-2">Portfolio</p>
          <h2 className="text-4xl md:text-7xl font-bold text-white uppercase tracking-tighter leading-none">Works</h2>
        </div>

        <div className="relative group h-[500px] md:h-[650px] overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={projects.length > 2}
            loopedSlides={projects.length > 0 ? projects.length : 5}
            speed={800}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 150, modifier: 2, slideShadows: true }}
            className="!pb-20 !pt-5 overflow-visible coverflow-carousel"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(320px, 80vw)' }} className="!flex items-center justify-center">
                {({ isActive }) => (
                  <div className={`relative w-full rounded-[25px] md:rounded-[35px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out ${
                    isActive 
                      ? 'h-[420px] md:h-[580px] border-white/20 bg-white/10 scale-100 z-10 hover:border-accent/50 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]' 
                      : 'h-[360px] md:h-[480px] border-white/5 bg-white/5 scale-[0.9] opacity-40'
                  }`}>
                    <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt={project.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className={`absolute bottom-0 left-0 p-5 md:p-10 w-full z-50 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <span className="text-accent text-[8px] md:text-[9px] tracking-[0.4em] uppercase font-black">{project.category}</span>
                      
                      <h3 className="text-xl md:text-3xl font-bold text-white uppercase mt-1 mb-4 md:mb-6 leading-[1.1] tracking-tighter">
                        {project.title}
                      </h3>

                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          setSelectedProject(project); 
                          setCurrentImageIndex(0); 
                        }} 
                        className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 md:px-8 md:py-3 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase hover:bg-accent transition-all cursor-pointer relative z-[60]"
                      >
                        View Case <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronLeft size={24} /></button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronRight size={24} /></button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/95 backdrop-blur-xl overflow-y-auto"
          >
            <button 
              onClick={() => setSelectedProject(null)} 
              className="fixed top-4 right-4 md:top-8 md:right-8 z-[10001] p-3 bg-white/10 rounded-full text-white hover:bg-accent transition-all"
            >
              <X size={20} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} 
              className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 max-w-[1400px] w-full p-6 md:p-12 my-12 md:my-0"
            >
              <div className="relative w-full lg:w-3/5 aspect-video md:h-[70vh] flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
                <motion.img 
                  key={currentImageIndex} 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                  className="max-w-full max-h-full object-contain p-4" alt={selectedProject.title} 
                />
                
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <button onClick={() => setCurrentImageIndex(prev => (prev - 1 + (selectedProject.all_images?.length || 1)) % (selectedProject.all_images?.length || 1))} className="p-2 rounded-full bg-black/50 text-white transition-colors hover:bg-accent"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentImageIndex(prev => (prev + 1) % (selectedProject.all_images?.length || 1))} className="p-2 rounded-full bg-black/50 text-white transition-colors hover:bg-accent"><ChevronRight size={18} /></button>
                  </div>
                )}
              </div>

              <div className="text-left lg:w-2/5 space-y-6">
                <div>
                  <span className="text-accent text-[9px] tracking-[0.5em] uppercase font-black">{selectedProject.category}</span>
                  <h2 className="text-3xl md:text-6xl font-bold text-white uppercase mt-2 tracking-tighter leading-none">{selectedProject.title}</h2>
                </div>

                <div className="space-y-4 bg-white/5 p-6 md:p-10 rounded-[25px] border border-white/10">
                  <p className="text-gray-300 text-sm md:text-lg leading-relaxed">
                    {selectedProject.overview || selectedProject.description}
                  </p>
                  
                  {selectedProject.workflow && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-white/40 text-[8px] uppercase tracking-widest mb-1 font-bold">The Process</p>
                      <p className="text-gray-400 text-xs md:text-sm italic">{selectedProject.workflow}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tools?.map((t: string) => (
                      <span key={t} className="px-3 py-1 border border-white/10 rounded text-[8px] uppercase text-white/60 font-bold bg-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
