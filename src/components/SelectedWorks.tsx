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

  // FIX: AUTO-HIDE NAVBAR (Hover only, vanishes when modal is open)
  useEffect(() => {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedProject) {
        if (e.clientY <= 60 || window.scrollY <= 50) {
          nav.style.opacity = '1';
          nav.style.transform = 'translateY(0)';
          nav.style.backdropFilter = 'blur(12px)';
          nav.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        } else {
          nav.style.opacity = '0';
          nav.style.transform = 'translateY(-100%)';
        }
      }
    };

    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      nav.style.opacity = '0';
      nav.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = 'unset';
      nav.style.opacity = '1';
      nav.style.pointerEvents = 'auto';
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
              // Map tech_stack string to array
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
    <section id="works" className="relative z-40 bg-transparent py-10 overflow-hidden min-h-[90vh] flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">Portfolio</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white uppercase tracking-tighter leading-none">Works</h2>
        </div>

        {/* CLAMPED HEIGHT: Prevents oversize and bouncing */}
        <div className="relative group h-[clamp(450px,60vh,650px)] overflow-visible">
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
            coverflowEffect={{ rotate: 8, stretch: 0, depth: 300, modifier: 1, slideShadows: true }}
            speed={700}
            className="!pb-20 !pt-5 overflow-visible coverflow-carousel"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(380px, 80vw)' }} className="!flex items-center justify-center">
                {({ isActive }) => (
                  <div className={`relative w-full rounded-[30px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out ${isActive ? 'h-[clamp(400px,55vh,600px)] border-white/20 bg-white/10 scale-100 z-10' : 'h-[clamp(350px,45vh,500px)] border-white/5 bg-white/5 scale-[0.85] opacity-60'}`}>
                    <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                    {isActive && <div className="absolute inset-0 rounded-[30px] ring-1 ring-accent/30 pointer-events-none" />}
                    <div className={`absolute bottom-0 left-0 p-6 md:p-8 w-full z-50 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <span className="text-accent text-[9px] tracking-[0.4em] uppercase font-black">{project.category}</span>
                      <h3 className="text-xl md:text-2xl font-bold text-white uppercase mt-1 mb-6 leading-none tracking-tighter">{project.title}</h3>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProject(project); setCurrentImageIndex(0); }} className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-accent transition-all cursor-pointer relative z-[60]">View Case <ChevronRight size={14} /></button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex"><ChevronLeft size={24} /></button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-[100] p-4 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent transition-all hidden xl:flex"><ChevronRight size={24} /></button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
            <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 z-[10000] p-4 bg-white/10 rounded-full text-white hover:bg-accent transition-all"><X size={28} /></button>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="flex flex-col md:flex-row items-center gap-12 max-w-7xl w-full">
              <div className="relative w-full md:w-3/5 h-[45vh] md:h-[75vh] flex items-center justify-center rounded-[40px] bg-black/20 overflow-hidden border border-white/5 shadow-2xl">
                <motion.img key={currentImageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} className="max-w-full max-h-full object-contain p-4" alt="" />
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + selectedProject.all_images.length) % selectedProject.all_images.length)}} className="p-3 rounded-full bg-black/60 text-white hover:bg-accent"><ChevronLeft size={20} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % selectedProject.all_images.length)}} className="p-3 rounded-full bg-black/60 text-white hover:bg-accent"><ChevronRight size={20} /></button>
                  </div>
                )}
              </div>

              {/* DETAILS FULLY RESTORED: Uses Admin Panel fields */}
              <div className="text-left md:w-2/5 p-4">
                <span className="text-accent text-xs tracking-[0.4em] uppercase font-bold">{selectedProject.category}</span>
                <h2 className="text-4xl md:text-6xl font-bold text-white uppercase mt-4 mb-8 tracking-tighter leading-none">{selectedProject.title}</h2>
                <div className="space-y-6">
                  {/* Overview Field */}
                  <p className="text-gray-400 text-lg leading-relaxed">{selectedProject.overview || selectedProject.description}</p>
                  
                  {/* Workflow Field */}
                  {selectedProject.workflow && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">The Process</p>
                      <p className="text-gray-500 text-sm leading-relaxed italic">{selectedProject.workflow}</p>
                    </div>
                  )}

                  {/* Tech Stack Field */}
                  <div className="pt-6 flex flex-wrap gap-2">
                    {selectedProject.tools.map((t: string) => (
                      <span key={t} className="px-3 py-1 border border-white/10 rounded-sm text-[9px] uppercase text-white/50 tracking-widest">{t}</span>
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
