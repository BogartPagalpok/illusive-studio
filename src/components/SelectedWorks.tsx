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
  [key: string]: any;
}

export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  // Hide nav when modal is open
  useEffect(() => {
    const nav = document.querySelector('nav');
    if (!nav) return;

    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      nav.style.opacity = '0';
      nav.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = 'unset';
      nav.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    }
  }, [selectedProject]);

  // Fetch projects
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
    <section id="works" className="relative z-10 bg-transparent min-h-screen py-12 overflow-hidden flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto px-4 w-full">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">Portfolio</p>
          <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tighter leading-none">Works</h2>
        </div>

        <div className="relative h-[clamp(460px,68vh,720px)]">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={projects.length > 2}
            speed={700}
            slidesPerView="auto"
            navigation={{
              nextEl: '.nav-next',
              prevEl: '.nav-prev'
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination',
              dynamicBullets: true,
            }}
            coverflowEffect={{
              rotate: 6,
              stretch: 0,
              depth: 180,
              modifier: 1.4,
              slideShadows: true,
            }}
            breakpoints={{
              320: { spaceBetween: 12 },
              640: { spaceBetween: 20 },
              1024: { spaceBetween: 30 },
            }}
            className="!pb-16 !pt-6 overflow-visible"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(360px, 92vw)' }} className="!flex items-center justify-center">
                {({ isActive }) => (
                  <motion.div
                    className={`relative w-full rounded-[32px] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-700 ease-out cursor-pointer
                      ${isActive 
                        ? 'h-[clamp(420px,58vh,620px)] border-white/30 bg-white/10 scale-100' 
                        : 'h-[clamp(360px,48vh,520px)] border-white/10 bg-white/5 scale-[0.87] opacity-60'
                      }`}
                    whileHover={{ scale: isActive ? 1.02 : 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentImageIndex(0);
                    }}
                  >
                    <img 
                      src={project.image_url} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      alt={project.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className={`absolute bottom-0 left-0 p-6 md:p-8 w-full z-50 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                      <span className="text-accent text-[9px] tracking-[0.4em] uppercase font-black">{project.category}</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white uppercase mt-1 mb-6 leading-none tracking-tighter">
                        {project.title}
                      </h3>
                      <button className="inline-flex items-center gap-2 bg-white text-black px-7 py-3 rounded-full text-xs font-black tracking-widest uppercase hover:bg-accent transition-all">
                        View Case <ChevronRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button className="nav-prev absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 md:p-4 rounded-full bg-black/70 border border-white/10 text-white hover:bg-accent transition-all shadow-xl">
            <ChevronLeft size={24} />
          </button>
          <button className="nav-next absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 md:p-4 rounded-full bg-black/70 border border-white/10 text-white hover:bg-accent transition-all shadow-xl">
            <ChevronRight size={24} />
          </button>

          {/* Pagination */}
          <div className="swiper-pagination mt-6" />
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence mode="wait">
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-2xl"
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 z-[10001] p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <X size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col lg:flex-row gap-8 max-w-[1450px] w-full"
            >
              {/* Image Gallery */}
              <div className="relative w-full lg:w-3/5 aspect-[16/10] lg:aspect-auto lg:h-[78vh] max-h-[85vh] rounded-[40px] bg-black/60 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url}
                    className="max-h-full max-w-full object-contain p-4"
                    alt={selectedProject.title}
                  />
                </AnimatePresence>

                {/* Image Navigation */}
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev - 1 + (selectedProject.all_images?.length || 1)) % (selectedProject.all_images?.length || 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all z-10"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev + 1) % (selectedProject.all_images?.length || 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all z-10"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="w-full lg:w-2/5 space-y-8 py-4">
                <div>
                  <span className="text-accent text-xs tracking-[0.5em] uppercase font-black">{selectedProject.category}</span>
                  <h2 className="text-5xl md:text-6xl font-bold text-white uppercase mt-3 tracking-tighter leading-none">
                    {selectedProject.title}
                  </h2>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 backdrop-blur-3xl">
                  <p className="text-gray-100 text-[17px] leading-relaxed">
                    {selectedProject.overview || selectedProject.description}
                  </p>

                  {selectedProject.workflow && (
                    <div className="pt-8 border-t border-white/10 mt-8">
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">STRATEGY & EXECUTION</p>
                      <p className="text-gray-300 italic leading-relaxed">{selectedProject.workflow}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-8">
                    {selectedProject.tools?.map((tool: string) => (
                      <span
                        key={tool}
                        className="px-5 py-2.5 text-xs font-bold tracking-widest uppercase border border-white/10 bg-white/5 rounded-2xl text-white/80"
                      >
                        {tool}
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
