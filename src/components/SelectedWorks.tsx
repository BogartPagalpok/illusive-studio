import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useScrollReveal } from '../hooks/useScrollReveal';
import FloatingCube from './FloatingCube';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  process: string;
  tools: string[];
  results: string;
  image_url: string;
  featured: boolean;
  all_images?: string[]; 
}

export default function SelectedWorks() {
  const { ref, isVisible } = useScrollReveal();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
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
        data.forEach((item) => {
          const cleanTitle = item.title.replace(/\.[^/.]+$/, "").replace(/\d+$/, "").trim();
          if (!grouped[cleanTitle]) {
            grouped[cleanTitle] = { ...item, title: cleanTitle, all_images: [item.image_url] };
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
    <section className="section-padding relative z-40 bg-transparent min-h-screen overflow-visible">
      <div id="works" className="absolute -top-24" />
      
      <div ref={ref} className="section-container relative z-30">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-heading">Portfolio</p>
          <h2 className="heading-lg uppercase font-bold text-white tracking-tighter">Selected Works</h2>
        </div>

        <div className="relative group px-4 overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            // FIXED: loop={false} kills the "slim/squashed" bug and the console warning
            loop={false} 
            slidesPerView={'auto'}
            navigation={{
              nextEl: '.nav-next',
              prevEl: '.nav-prev',
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: -20, // Reduced from -60 to prevent excessive overlapping on smaller views
              depth: 150,
              modifier: 1,
              slideShadows: false,
            }}
            className="!pb-24 !pt-10 overflow-visible"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} className="max-w-[300px] md:max-w-[420px] !flex items-center justify-center">
                <div 
                  className="relative w-full h-[500px] md:h-[650px] rounded-[45px] border border-white/10 overflow-hidden backdrop-blur-3xl bg-white/5 transition-all duration-500 shadow-2xl"
                >
                  <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover" alt={project.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-10 w-full z-20">
                    <span className="text-accent text-[10px] tracking-[0.3em] uppercase font-bold">{project.category}</span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white uppercase mt-2 mb-8 leading-none tracking-tighter">{project.title}</h3>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-accent hover:text-black backdrop-blur-md border border-white/10 px-8 py-4 rounded-full text-[10px] tracking-widest uppercase text-white transition-all cursor-pointer font-bold relative z-30"
                    >
                      View Project <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-[70] p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-accent hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronLeft size={24} />
          </button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-[70] p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-accent hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
            <div className="absolute inset-0" onClick={() => setSelectedProject(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-full max-w-7xl h-[90vh] bg-neutral-900 border border-white/10 rounded-[40px] overflow-hidden flex flex-col md:flex-row backdrop-blur-3xl shadow-2xl"
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 z-[120] p-3 bg-black/50 rounded-full text-white hover:bg-accent hover:text-black transition-all">
                <X size={24} />
              </button>

              <div className="w-full md:w-3/5 h-1/2 md:h-full bg-black/50 p-6 flex items-center justify-center">
                <img 
                   src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                   className="max-w-full max-h-full object-contain"
                   alt={selectedProject.title}
                />
              </div>

              <div className="w-full md:w-2/5 p-8 md:p-16 overflow-y-auto custom-scrollbar bg-black/20">
                <span className="text-accent text-[10px] tracking-widest uppercase">{selectedProject.category}</span>
                <h2 className="text-4xl font-bold text-white uppercase mt-4 mb-8 leading-tight tracking-tighter">{selectedProject.title}</h2>
                <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
                   <p>{selectedProject.description}</p>
                   <div className="pt-8 border-t border-white/10">
                      <h4 className="text-[10px] uppercase text-white/50 tracking-[0.3em] mb-4">Tools Lab</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tools?.map(tool => (
                          <span key={tool} className="px-3 py-1 border border-white/10 rounded-sm text-[9px] uppercase text-white">{tool}</span>
                        ))}
                      </div>
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
