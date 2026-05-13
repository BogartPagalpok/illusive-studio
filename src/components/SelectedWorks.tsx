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

export default function SelectedWorks() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  const swiperRef = useRef<SwiperType | null>(null);

  // Body scroll lock triggers the Navbar's own opacity logic
  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : 'unset';
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (data) {
        const grouped: Record<string, any> = {};
        data.forEach((item) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, '').trim();
          if (!grouped[cleanTitle]) {
            grouped[cleanTitle] = { 
              ...item, 
              title: cleanTitle, 
              all_images: [item.image_url],
              // Admin Panel uses tech_stack string -> Convert to array
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
    <section id="works" className="relative z-10 bg-transparent min-h-screen py-20 overflow-hidden flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">Portfolio</p>
          <h2 className="text-6xl md:text-8xl font-bold text-white uppercase tracking-tighter leading-none">Works</h2>
        </div>

        <div className="relative group h-[600px] md:h-[750px] overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            loopedSlides={5}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{ rotate: 5, stretch: 0, depth: 250, modifier: 1, slideShadows: true }}
            speed={700}
            className="!pb-24 !pt-10 overflow-visible coverflow-carousel"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(400px, 90vw)' }} className="!flex items-center justify-center">
                {({ isActive }) => (
                  <div className={`relative w-full rounded-[40px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out ${isActive ? 'h-[550px] md:h-[700px] border-white/20 bg-white/10 scale-100 z-10' : 'h-[450px] md:h-[550px] border-white/5 bg-white/5 scale-[0.9] opacity-40'}`}>
                    <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                    <div className={`absolute bottom-0 left-0 p-10 w-full z-50 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <span className="text-accent text-[10px] tracking-[0.4em] uppercase font-black">{project.category}</span>
                      <h3 className="text-2xl md:text-4xl font-bold text-white uppercase mt-2 mb-8 leading-none tracking-tighter">{project.title}</h3>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProject(project); setCurrentImageIndex(0); }} className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full text-[11px] font-black tracking-widest uppercase hover:bg-accent transition-all cursor-pointer relative z-[60]">View Case <ChevronRight size={16} /></button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button className="nav-prev absolute left-4 top-1/2 -translate-y-1/2 z-[100] p-5 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronLeft size={32} /></button>
          <button className="nav-next absolute right-4 top-1/2 -translate-y-1/2 z-[100] p-5 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex shadow-2xl"><ChevronRight size={32} /></button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-2xl">
            <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 z-[10001] p-5 bg-white/10 rounded-full text-white hover:bg-accent transition-all"><X size={32} /></button>
            
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="flex flex-col lg:flex-row items-center gap-16 max-w-[1600px] w-full">
              <div className="relative w-full lg:w-3/5 h-[50vh] lg:h-[80vh] flex items-center justify-center rounded-[50px] bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
                <motion.img key={currentImageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} className="max-w-full max-h-full object-contain p-8" alt="" />
                
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-6">
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + selectedProject.all_images.length) % selectedProject.all_images.length)}} className="p-4 rounded-full bg-black/60 text-white hover:bg-accent transition-all z-[10002]"><ChevronLeft size={24} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % selectedProject.all_images.length)}} className="p-4 rounded-full bg-black/60 text-white hover:bg-accent transition-all z-[10002]"><ChevronRight size={24} /></button>
                  </div>
                )}
              </div>

              <div className="text-left lg:w-2/5 p-6 space-y-10">
                <div>
                  <span className="text-accent text-xs tracking-[0.5em] uppercase font-black">{selectedProject.category}</span>
                  <h2 className="text-6xl md:text-8xl font-bold text-white uppercase mt-4 tracking-tighter leading-[0.9] drop-shadow-2xl">{selectedProject.title}</h2>
                </div>

                <div className="space-y-8 bg-black/40 p-8 rounded-[30px] backdrop-blur-md border border-white/5">
                  {/* DATA MAPPING: overview, workflow, tools */}
                  <p className="text-gray-100 text-xl leading-relaxed font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {selectedProject.overview || selectedProject.description}
                  </p>
                  
                  {selectedProject.workflow && (
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-white/40 text-[11px] uppercase tracking-[0.3em] mb-3 font-bold">Process & Strategy</p>
                      <p className="text-gray-300 text-base leading-relaxed italic drop-shadow-sm">{selectedProject.workflow}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {selectedProject.tools?.map((t: string) => (
                      <span key={t} className="px-4 py-2 border border-white/20 rounded-lg text-[10px] uppercase text-white font-bold tracking-widest bg-white/5 shadow-sm">{t}</span>
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
