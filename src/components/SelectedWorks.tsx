import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useScrollReveal } from '../hooks/useScrollReveal';
import FloatingCube from './FloatingCube';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
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
  const bgRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

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
            // Grouping by title to treat bulk uploads as folders
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

          // Removed .slice(0, 5) to allow 100+ projects
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
    <section id="works" ref={sectionRef} className="section-padding relative overflow-hidden bg-black min-h-screen">
      <FloatingCube type="Lr" size={90} top="15%" left="8%" blur="2px" delay={0.2} duration={6} />
      <FloatingCube type="CapCut" size={110} bottom="10%" right="5%" blur="3px" delay={0.8} duration={8} />

      <div ref={ref} className="section-container relative z-20">
        <motion.div className="text-center mb-12">
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">{content.subtitle}</p>
          <h2 className="text-white font-bold tracking-tighter heading-lg uppercase">{content.heading}</h2>
          <p className="mt-4 text-zinc-400 text-base max-w-2xl mx-auto">{content.description}</p>
        </motion.div>

        <div className="relative w-full max-w-[100vw] px-4">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            loop={true} // Infinite Scroll Enabled
            
            // BREAKPOINTS: Shows max 5 items on screen at once
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 30 },
              1200: { slidesPerView: 5, spaceBetween: 40 },
            }}

            coverflowEffect={{ 
              rotate: 0, 
              stretch: 0, 
              depth: 100, 
              modifier: 2.5, 
              slideShadows: false 
            }}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="works-swiper !pb-12"
          >
            {projects.map((project, idx) => (
              <SwiperSlide key={`${project.id}-${idx}`} className="!h-[500px] md:!h-[600px]">
                <div className="h-full w-full bg-white/[0.03] border border-white/10 overflow-hidden group relative">
                  <img 
                    src={project.image_url} 
                    className="absolute inset-0 w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <p className="text-accent text-[10px] tracking-widest uppercase mb-2">{project.category}</p>
                    <h3 className="text-white font-bold text-xl uppercase mb-4 leading-tight">{project.title}</h3>
                    <button 
                      onClick={() => { setSelectedProject(project); setCurrentImageIndex(0); }}
                      className="text-white text-[10px] tracking-widest uppercase border-b border-accent pb-1 hover:text-accent transition-colors"
                    >
                      View Project
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedProject(null)} />
            
            <motion.div className="relative w-full max-w-6xl h-[90vh] bg-zinc-950 border border-white/10 overflow-hidden flex flex-col md:flex-row">
              <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white"><X size={30} /></button>

              <div className="w-full md:w-3/5 h-1/2 md:h-full bg-black relative flex items-center justify-center group">
                <img
                  src={selectedProject.all_images ? selectedProject.all_images[currentImageIndex] : selectedProject.image_url}
                  className="max-w-full max-h-full object-contain"
                />
                
                {selectedProject.all_images && selectedProject.all_images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={30} /></button>
                    <button onClick={nextImage} className="absolute right-4 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={30} /></button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/40 tracking-widest uppercase">
                      {currentImageIndex + 1} / {selectedProject.all_images.length}
                    </div>
                  </>
                )}
              </div>

              <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <p className="text-accent text-xs tracking-widest uppercase mb-2">{selectedProject.category}</p>
                <h2 className="text-white font-bold text-3xl uppercase mb-8">{selectedProject.title}</h2>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-3">Overview</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{selectedProject.description}</p>
                  </div>
                  
                  {selectedProject.process && (
                    <div>
                      <h4 className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-3">Process</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">{selectedProject.process}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-3">Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedProject.tools) ? selectedProject.tools : []).map(tool => (
                          <span key={tool} className="text-[9px] border border-white/10 px-2 py-1 text-white/60 uppercase">{tool}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-3">Results</h4>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">{selectedProject.results}</p>
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
