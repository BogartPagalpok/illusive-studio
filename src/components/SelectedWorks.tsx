import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useScrollReveal } from '../hooks/useScrollReveal';
import FloatingCube from './FloatingCube';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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

interface WorksContent {
  subtitle: string;
  heading: string;
  description: string;
}

const defaultContent: WorksContent = {
  subtitle: 'Portfolio',
  heading: 'Selected Works',
  description: 'Quality over quantity — each project represents a deep commitment to craft, strategy, and visual storytelling.',
};

export default function SelectedWorks() {
  const { ref, isVisible } = useScrollReveal();
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<WorksContent>(defaultContent);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  
  const sectionRef = useRef<HTMLElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProject]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: contentData } = await supabase.from('site_content').select('key, value').eq('section', 'works');
        if (contentData) {
          const mapped = { ...defaultContent };
          contentData.forEach(row => {
            const key = row.key.toLowerCase() as keyof WorksContent;
            if (key in mapped) mapped[key] = row.value;
          });
          setContent(mapped);
        }

        const { data: projectData } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('featured', true)
          .order('created_at', { ascending: false });

        if (projectData) {
          const grouped: Record<string, Project> = {};
          projectData.forEach((item) => {
            const cleanTitle = item.title.replace(/\.[^/.]+$/, "").replace(/\d+$/, "").trim();
            if (!grouped[cleanTitle]) {
              grouped[cleanTitle] = { 
                ...item, 
                title: cleanTitle,
                all_images: [item.image_url] 
              };
            } else {
              grouped[cleanTitle].all_images?.push(item.image_url);
            }
          });
          setProjects(Object.values(grouped));
        }
      } catch (e) {
        console.error('Error fetching projects:', e);
      }
    };
    fetchData();
  }, []);

  const nextImage = () => {
    if (selectedProject?.all_images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.all_images!.length);
    }
  };

  const prevImage = () => {
    if (selectedProject?.all_images) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProject.all_images!.length) % selectedProject.all_images!.length);
    }
  };

  return (
    <section ref={sectionRef} className="section-padding relative overflow-visible z-40 bg-transparent min-h-screen">
      <div id="works" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />
      
      <FloatingCube type="Lr" size={90} top="15%" left="8%" blur="2px" delay={0.2} duration={6} />
      <FloatingCube type="CapCut" size={110} bottom="10%" right="5%" blur="3px" delay={0.8} duration={8} />

      <div ref={ref} className="section-container relative z-20">
        <motion.div className="text-center mb-12">
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">{content.subtitle}</p>
          <h2 className="font-bold tracking-tighter heading-lg uppercase text-white">{content.heading}</h2>
          <p className="mt-4 text-base max-w-2xl mx-auto text-[#efefef]">{content.description}</p>
        </motion.div>

        <div className="relative w-full max-w-[100vw] px-4 md:px-12 group">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            grabCursor={true}
            centeredSlides={false}
            loop={false}
            preventClicks={true}
            preventClicksPropagation={true}
            slideToClickedSlide={false}
            touchReleaseOnEdges={true}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
            }}
            modules={[Pagination, Navigation]}
            className="works-swiper !pb-12"
          >
            {projects.map((project, idx) => (
              <SwiperSlide key={`${project.id}-${idx}`} className="!h-[500px] md:!h-[600px]">
                <div 
                  className="h-full w-full rounded-3xl border border-white/10 overflow-hidden group/card relative backdrop-blur-[32px] saturate-[180%]"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <img 
                    src={project.image_url} 
                    className="absolute inset-0 w-full h-full object-cover grayscale-[50%] group-hover/card:grayscale-0 transition-all duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full z-30">
                    <p className="text-accent text-[10px] tracking-widest uppercase mb-2">{project.category}</p>
                    <h3 className="font-bold text-xl uppercase mb-4 leading-tight text-white">{project.title}</h3>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setSelectedProject(project); 
                        setCurrentImageIndex(0); 
                      }}
                      className="relative z-50 text-white text-[10px] tracking-widest uppercase border-b border-accent pb-1 hover:text-accent transition-colors cursor-pointer"
                    >
                      View Project
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* CUSTOM NAVIGATION ARROWS */}
          <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-accent hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center">
            <ChevronLeft size={30} />
          </button>
          <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-accent hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center">
            <ChevronRight size={30} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90vh] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl bg-black/40 backdrop-blur-2xl"
            >
              <button 
                onClick={() => setSelectedProject(null)} 
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[110] p-2 rounded-full bg-black/50 border border-white/20 text-white hover:bg-accent hover:text-black hover:border-transparent transition-all"
              >
                <X size={24} />
              </button>

              <div className="w-full md:w-3/5 h-[40vh] md:h-full relative flex items-center justify-center group bg-black/50">
                <img
                  src={selectedProject.all_images ? selectedProject.all_images[currentImageIndex] : selectedProject.image_url}
                  className="max-w-full max-h-full object-contain p-4"
                />
                
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 p-2 rounded-full bg-black/50 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={24} /></button>
                    <button onClick={nextImage} className="absolute right-4 p-2 rounded-full bg-black/50 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={24} /></button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white tracking-widest uppercase bg-black/50 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                      {currentImageIndex + 1} / {selectedProject.all_images.length}
                    </div>
                  </>
                )}
              </div>

              <div className="w-full md:w-2/5 p-6 md:p-12 overflow-y-auto custom-scrollbar">
                <p className="text-accent text-xs tracking-widest uppercase mb-2">{selectedProject.category}</p>
                <h2 className="font-bold text-2xl md:text-3xl uppercase mb-8 text-white">{selectedProject.title}</h2>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] mb-3 text-white/60">Overview</h4>
                    <p className="text-sm leading-relaxed text-[#efefef]">{selectedProject.description}</p>
                  </div>
                  
                  {selectedProject.process && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.3em] mb-3 text-white/60">Process</h4>
                      <p className="text-sm leading-relaxed text-[#efefef]">{selectedProject.process}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.3em] mb-3 text-white/60">Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedProject.tools) ? selectedProject.tools : []).map(tool => (
                          <span 
                            key={tool} 
                            className="text-[9px] border border-white/20 px-2 py-1 uppercase rounded-sm text-[#efefef]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.3em] mb-3 text-white/60">Results</h4>
                      <p className="text-[11px] leading-relaxed text-[#efefef]">{selectedProject.results}</p>
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
