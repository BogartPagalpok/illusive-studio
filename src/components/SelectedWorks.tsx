import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useScrollReveal } from '../hooks/useScrollReveal';
import FloatingCube from './FloatingCube';

import 'swiper/css';
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
    <section className="section-padding relative z-40 bg-transparent min-h-screen">
      <div id="works" className="absolute -top-24" />
      
      <div ref={ref} className="section-container">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-accent mb-4 font-heading">Portfolio</p>
          <h2 className="heading-lg uppercase font-bold text-white tracking-tighter">Selected Works</h2>
        </div>

        <div className="relative group px-4 md:px-12">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              nextEl: '.nav-next',
              prevEl: '.nav-prev',
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            spaceBetween={30}
            slidesPerView={1}
            grabCursor={true}
            // FIXED: Standard slide prevents the "slim" look
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="pb-16"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id}>
                <div 
                  className="relative h-[500px] rounded-3xl border border-white/10 overflow-hidden backdrop-blur-2xl bg-white/5 transition-transform duration-500 hover:scale-[1.02]"
                >
                  <img src={project.image_url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                    <span className="text-accent text-[10px] tracking-widest uppercase">{project.category}</span>
                    <h3 className="text-2xl font-bold text-white uppercase mt-2 mb-6">{project.title}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      className="inline-block border-b border-accent pb-1 text-[10px] tracking-widest uppercase text-white hover:text-accent transition-colors cursor-pointer"
                    >
                      View Project
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* CUSTOM ARROWS: Only visible on desktop hover */}
          <button className="nav-prev absolute left-0 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-accent hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronLeft size={24} />
          </button>
          <button className="nav-next absolute right-0 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-accent hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* PROJECT MODAL with Glassmorphism */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <div className="absolute inset-0" onClick={() => setSelectedProject(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-6xl h-[85vh] bg-neutral-900/80 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row backdrop-blur-3xl shadow-2xl"
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 z-[110] p-2 bg-black/50 rounded-full text-white hover:bg-accent hover:text-black transition-all">
                <X size={24} />
              </button>

              <div className="w-full md:w-3/5 h-1/2 md:h-full bg-black/40 p-4 flex items-center justify-center">
                <img 
                   src={selectedProject.all_images?.[currentImageIndex] || selectedProject.image_url} 
                   className="max-w-full max-h-full object-contain shadow-2xl"
                />
              </div>

              <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-black/20">
                <span className="text-accent text-[10px] tracking-widest uppercase">{selectedProject.category}</span>
                <h2 className="text-3xl font-bold text-white uppercase mt-4 mb-8">{selectedProject.title}</h2>
                <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
                   <p>{selectedProject.description}</p>
                   <div className="pt-6 border-t border-white/5">
                      <h4 className="text-[10px] uppercase text-white/50 tracking-widest mb-4">Tools Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tools?.map(tool => (
                          <span key={tool} className="px-3 py-1 border border-white/10 rounded-full text-[9px] uppercase tracking-tighter text-white">{tool}</span>
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
