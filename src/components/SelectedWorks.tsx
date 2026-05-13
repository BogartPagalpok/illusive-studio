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
  const [imageLoading, setImageLoading] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedProject) {
        if (e.clientY <= 80 || window.scrollY <= 50) {
          nav.style.opacity = '1';
          nav.style.transform = 'translateY(0)';
          nav.style.pointerEvents = 'auto';
        } else {
          nav.style.opacity = '0';
          nav.style.transform = 'translateY(-100%)';
          nav.style.pointerEvents = 'none';
        }
      }
    };

    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      nav.style.opacity = '0';
      nav.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = 'unset';
      nav.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
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

  const handleImageChange = (direction: 'next' | 'prev') => {
    setImageLoading(true);
    const total = selectedProject?.all_images?.length || 1;
    setCurrentImageIndex(prev =>
      direction === 'next' ? (prev + 1) % total : (prev - 1 + total) % total
    );
    setTimeout(() => setImageLoading(false), 300);
  };

  return (
    <section id="works" className="relative z-10 bg-transparent min-h-screen py-10 md:py-16 lg:py-20 overflow-hidden flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-accent mb-2">
            Portfolio
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tighter leading-none">
            Works
          </h2>
        </div>

        {/* Swiper Carousel */}
        <div className="relative group h-[400px] sm:h-[500px] md:h-[600px] lg:h-[clamp(480px,65vh,720px)] overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={projects.length > 2}
            loopedSlides={projects.length > 0 ? projects.length : undefined}
            speed={600}
            slidesPerView="auto"
            navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
            coverflowEffect={{
              rotate: 5,
              stretch: 0,
              depth: 250,
              modifier: 1,
              slideShadows: true
            }}
            className="!pb-16 sm:!pb-20 md:!pb-24 !pt-6 sm:!pt-8 md:!pt-10 overflow-visible coverflow-carousel"
          >
            {projects.map((project) => (
              <SwiperSlide
                key={project.id}
                style={{ width: 'clamp(280px, 85vw, 380px)' }}
                className="!flex items-center justify-center"
              >
                {({ isActive }) => (
                  <div
                    className={`
                      relative w-full rounded-3xl sm:rounded-[35px] border overflow-hidden backdrop-blur-3xl shadow-2xl
                      transition-all duration-500 ease-out
                      ${isActive
                        ? 'h-[350px] sm:h-[450px] md:h-[clamp(450px,60vh,650px)] border-white/20 bg-white/10 scale-100 z-10'
                        : 'h-[300px] sm:h-[380px] md:h-[clamp(380px,50vh,550px)] border-white/5 bg-white/5 scale-[0.88] opacity-50'
                      }
                    `}
                  >
                    <img
                      src={project.image_url}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      alt={project.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />

                    <div
                      className={`
                        absolute bottom-0 left-0 p-6 sm:p-8 md:p-10 w-full z-50
                        transition-all duration-300 ease-out
                        ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                      `}
                    >
                      <span className="text-accent text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase font-black">
                        {project.category}
                      </span>
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white uppercase mt-1 mb-4 sm:mb-6 leading-none tracking-tighter">
                        {project.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedProject(project);
                          setCurrentImageIndex(0);
                        }}
                        className="inline-flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase hover:bg-accent hover:scale-105 transition-all duration-300 cursor-pointer relative z-[60]"
                      >
                        View Case <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button className="nav-prev absolute left-2 lg:left-0 top-1/2 -translate-y-1/2 z-[100] p-3 lg:p-4 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent hover:scale-110 transition-all duration-300 shadow-2xl">
            <ChevronLeft size={20} className="lg:w-6 lg:h-6" />
          </button>
          <button className="nav-next absolute right-2 lg:right-0 top-1/2 -translate-y-1/2 z-[100] p-3 lg:p-4 rounded-full bg-black/80 border border-white/10 text-white hover:bg-accent hover:scale-110 transition-all duration-300 shadow-2xl">
            <ChevronRight size={20} className="lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-black/60 backdrop-blur-2xl"
            onClick={() => setSelectedProject(null)}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-[10001] p-3 sm:p-4 lg:p-5 bg-white/10 rounded-full text-white hover:bg-accent hover:rotate-90 transition-all duration-300"
            >
              <X size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12 max-w-[1500px] w-full max-h-[90vh] overflow-y-auto lg:overflow-visible"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Container */}
              <div className="relative w-full lg:w-3/5 h-[40vh] sm:h-[50vh] lg:h-[75vh] flex items-center justify-center rounded-3xl sm:rounded-[35px] lg:rounded-[45px] bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url}
                    className="max-w-full max-h-full object-contain p-4 sm:p-6"
                    alt={selectedProject.title}
                  />
                </AnimatePresence>

                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageChange('prev');
                      }}
                      className="absolute left-2 sm:left-4 lg:left-6 p-2 sm:p-3 lg:p-4 rounded-full bg-black/60 text-white hover:bg-accent hover:scale-110 transition-all duration-300 z-[10002]"
                    >
                      <ChevronLeft size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageChange('next');
                      }}
                      className="absolute right-2 sm:right-4 lg:right-6 p-2 sm:p-3 lg:p-4 rounded-full bg-black/60 text-white hover:bg-accent hover:scale-110 transition-all duration-300 z-[10002]"
                    >
                      <ChevronRight size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 rounded-full text-white text-xs sm:text-sm">
                      {currentImageIndex + 1} / {selectedProject.all_images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-left lg:w-2/5 p-0 sm:p-4 space-y-6 sm:space-y-8 w-full"
              >
                <div>
                  <span className="text-accent text-[10px] sm:text-xs tracking-[0.4em] sm:tracking-[0.5em] uppercase font-black">
                    {selectedProject.category}
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white uppercase mt-2 sm:mt-4 tracking-tighter leading-none">
                    {selectedProject.title}
                  </h2>
                </div>

                <div className="space-y-4 sm:space-y-6 bg-white/5 p-6 sm:p-8 lg:p-10 rounded-3xl sm:rounded-[35px] lg:rounded-[40px] backdrop-blur-3xl border border-white/10 shadow-2xl">
                  <p className="text-gray-100 text-base sm:text-lg lg:text-xl leading-relaxed font-medium">
                    {selectedProject.overview || selectedProject.description}
                  </p>

                  {selectedProject.workflow && (
                    <div className="pt-4 sm:pt-6 border-t border-white/10">
                      <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] mb-2 font-bold italic">
                        Strategy & Execution
                      </p>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed italic">
                        {selectedProject.workflow}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedProject.tools?.map((t: string) => (
                      <span
                        key={t}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 border border-white/10 rounded-lg text-[9px] sm:text-[10px] uppercase text-white/80 font-bold tracking-[0.15em] sm:tracking-[0.2em] bg-white/5 shadow-inner"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
