import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
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
    const nav = document.querySelector('nav') as HTMLElement | null;
    if (!nav) return;
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      nav.style.opacity = '0';
    } else {
      document.body.style.overflow = 'unset';
      nav.style.opacity = '1';
    }
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

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
        <div className="text-center mb-12">
          <p className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-accent mb-2 font-black italic">Curated Gallery</p>
          <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none italic">Selected Works</h2>
        </div>

        <div className="relative group overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={projects.length > 2}
            loopedSlides={projects.length > 0 ? projects.length : 5}
            speed={900}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 160, modifier: 2.5, slideShadows: false }}
            className="!pb-24 !pt-10 overflow-visible coverflow-carousel"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(400px, 85vw)' }} className="!flex items-center justify-center">
                {({ isActive }) => (
                  <div className={`relative w-full aspect-[3/4.2] rounded-[40px] border transition-all duration-700 ease-out overflow-hidden group/card ${
                    isActive 
                      ? 'border-white/30 bg-white/5 scale-100 z-10 shadow-[0_0_80px_rgba(255,255,255,0.1)]' 
                      : 'border-white/5 bg-white/[0.02] scale-[0.85] opacity-30 blur-[2px]'
                  }`}>
                    {/* Background Subtle Gradient & Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent)] opacity-50" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                    {/* Image Wrapper with Zoom Effect on Hover */}
                    <div className="absolute inset-0 p-6 pb-40">
                       <div className="w-full h-full rounded-[30px] overflow-hidden border border-white/10 relative">
                          <img src={project.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" alt={project.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <Maximize2 size={16} className="text-white" />
                          </div>
                       </div>
                    </div>
                    
                    {/* Bottom Content Area */}
                    <div className={`absolute bottom-0 left-0 p-8 w-full z-50 transition-all duration-500 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                      <span className="text-accent text-[9px] tracking-[0.5em] uppercase font-black mb-2 block">{project.category}</span>
                      <h3 className="text-2xl md:text-4xl font-black text-white uppercase mt-1 mb-6 leading-[0.9] tracking-tighter italic">
                        {project.title}
                      </h3>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProject(project); setCurrentImageIndex(0); }} 
                        className="w-full bg-white text-black py-4 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        Explore Case Study <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/98 backdrop-blur-3xl overflow-y-auto">
            <button onClick={() => setSelectedProject(null)} className="fixed top-8 right-8 z-[10001] p-4 bg-white/10 rounded-full text-white hover:bg-accent transition-all"><X size={28} /></button>
            
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col lg:flex-row items-center gap-12 max-w-[1500px] w-full p-6 md:p-12">
              
              {/* IMAGE VIEWER: Zoomable/Draggable logic would go here, simplified for display */}
              <div className="relative w-full lg:w-3/5 group">
                <div className="aspect-[4/5] lg:h-[80vh] flex items-center justify-center rounded-[40px] bg-white/[0.03] border border-white/10 overflow-hidden shadow-3xl">
                  <motion.img 
                    key={currentImageIndex} 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                    className="w-full h-full object-contain p-4 md:p-10 cursor-zoom-in" 
                    alt={selectedProject.title} 
                  />
                  
                  {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); const len = selectedProject.all_images?.length || 1; setCurrentImageIndex(prev => (prev - 1 + len) % len)}} className="p-4 rounded-full bg-black/60 text-white hover:bg-accent border border-white/10"><ChevronLeft size={24} /></button>
                      <button onClick={(e) => { e.stopPropagation(); const len = selectedProject.all_images?.length || 1; setCurrentImageIndex(prev => (prev + 1) % len)}} className="p-4 rounded-full bg-black/60 text-white hover:bg-accent border border-white/10"><ChevronRight size={24} /></button>
                    </div>
                  )}
                </div>
              </div>

              {/* CONTENT SECTION */}
              <div className="text-left w-full lg:w-2/5 space-y-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="h-[2px] w-12 bg-accent" />
                    <span className="text-accent text-xs tracking-[0.5em] uppercase font-black">{selectedProject.category}</span>
                  </div>
                  <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] italic">{selectedProject.title}</h2>
                </div>

                <div className="space-y-6 bg-white/[0.03] p-8 md:p-12 rounded-[40px] border border-white/10 shadow-inner">
                  <p className="text-gray-200 text-lg md:text-xl leading-relaxed font-medium">
                    {selectedProject.overview || selectedProject.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-4">
                    {selectedProject.tools?.map((t: string) => (
                      <span key={t} className="px-5 py-2 border border-white/10 rounded-xl text-[10px] uppercase text-white/80 font-bold tracking-[0.2em] bg-white/5">
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
