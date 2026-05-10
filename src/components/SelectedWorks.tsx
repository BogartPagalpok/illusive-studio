import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
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
}

interface WorksContent {
  subtitle: string;
  heading: string;
  description: string;
}

const defaultContent: WorksContent = {
  subtitle: 'Portfolio',
  heading: 'Selected Works',
  description: 'Quality over quantity \u2014 each project represents a deep commitment to craft, strategy, and visual storytelling.',
};

const defaultProjects: Project[] = [
  {
    id: '1',
    title: 'Aurora Brand System',
    category: 'Brand Identity',
    description: 'A complete visual identity for a sustainable fashion startup, from logo to packaging design.',
    process: 'Research-driven approach starting with competitive analysis, mood boarding, and iterative sketching before finalizing the mark and building the full system.',
    tools: ['Photoshop', 'Illustrator', 'Canva'],
    results: 'Client saw a 40% increase in brand recognition within 3 months of launch.',
    image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
    featured: true,
  },
  {
    id: '2',
    title: 'Solstice Portrait Series',
    category: 'Photography',
    description: 'A curated portrait series capturing the golden hour essence across diverse subjects.',
    process: 'Location scouting, natural light optimization, and post-processing in Lightroom with custom presets for cohesive tonal grading.',
    tools: ['Adobe Lightroom', 'Camera'],
    results: 'Featured in two online photography showcases and drove 200+ inquiries.',
    image_url: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&q=80&w=800',
    featured: true,
  },
  {
    id: '3',
    title: 'Mythos Digital Collection',
    category: 'Digital Painting',
    description: 'A series of mythological reinterpretations blending classical techniques with digital artistry.',
    process: 'Initial pencil sketches digitized and painted in Photoshop using custom brushes, with layered textures for depth and atmosphere.',
    tools: ['Photoshop', 'Wacom Tablet'],
    results: 'Garnered 15K+ views on art platforms and three commission requests.',
    image_url: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800',
    featured: true,
  },
  {
    id: '4',
    title: 'Vertex Event Branding',
    category: 'Graphic Design',
    description: 'Full event branding package for a tech conference including posters, badges, and digital assets.',
    process: 'Collaborative ideation with the events team, rapid prototyping of key visuals, and systematic rollout across all touchpoints.',
    tools: ['Photoshop', 'Canva', 'Illustrator'],
    results: 'Event attendance increased 25% year-over-year with the refreshed visual identity.',
    image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800',
    featured: true,
  },
];

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';

export default function SelectedWorks() {
  const { ref, isVisible } = useScrollReveal();
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [content, setContent] = useState<WorksContent>(defaultContent);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: contentData, error: contentError } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'works');

        if (contentError) throw contentError;

        if (contentData && contentData.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of contentData) {
            const key = row.key.toLowerCase() as keyof WorksContent;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);
        }

        const { data: projectData, error: projectError } = await supabase
          .from('portfolio_projects')
          .select('id, title, category, description, process, tools, results, image_url, featured')
          .eq('featured', true)
          .order('created_at', { ascending: false });

        if (projectError) throw projectError;

        if (projectData && projectData.length > 0) {
          setProjects(projectData as Project[]);
        }
      } catch (e: any) {
        console.warn('Using default works content due to fetch error:', e.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bg,
        { yPercent: 0 },
        {
          yPercent: -25,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="works" ref={sectionRef} className="section-padding relative overflow-hidden bg-black">
      {/* Floating 3D Identities */}
      <FloatingCube type="Lr" size={90} top="15%" left="8%" blur="2px" delay={0.2} duration={6} />
      <FloatingCube type="CapCut" size={110} bottom="10%" right="5%" blur="3px" delay={0.8} duration={8} />

      {/* Parallax depth layer */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        <div
          className="absolute top-10 right-0 text-[12vw] font-heading font-black tracking-widest uppercase select-none whitespace-nowrap text-white/[0.03]"
        >
          
        </div>
        <div
          className="absolute bottom-20 -left-20 text-[6vw] font-heading font-black tracking-widest uppercase select-none whitespace-nowrap text-white/[0.03]"
        >
          
        </div>
      </div>

      <div ref={ref} className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
            {content.subtitle}
          </p>
          <h2 className="text-white font-bold tracking-tighter heading-lg">
            {content.heading.split(' ').length > 1 ? (
              <>
                {content.heading.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-accent">{content.heading.split(' ').slice(-1)}</span>
              </>
            ) : (
              content.heading
            )}
          </h2>
          <p className="mt-4 text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
          <div className="mt-6 w-20 h-0.5 bg-accent mx-auto" />
        </motion.div>

        {/* 3D Coverflow Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 200,
              modifier: 2.5,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="works-swiper"
          >
            {[...projects, ...projects, ...projects].map((project, i) => (
              <SwiperSlide key={`${project.id}-${i}`} className="works-swiper-slide">
                <div
                  className="h-[600px] w-full max-w-md mx-auto backdrop-blur-xl rounded-none overflow-hidden flex flex-col bg-white/[0.02] border border-white/10 group/card"
                >
                  {/* Image */}
                  <div className="relative h-full overflow-hidden">
                    <img
                      src={project.image_url || PLACEHOLDER_IMAGE}
                      alt={project.title}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = PLACEHOLDER_IMAGE;
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 z-0"
                    />
                    
                    {/* Text Tint Overlay (Layered between image and text) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-black/95 z-10" />

                    {/* Content Overlay */}
                    <div className="relative z-20 h-full p-8 flex flex-col justify-end">
                      <div>
                        <p className="text-xs font-heading tracking-[0.2em] uppercase text-accent mb-3">
                          {project.category}
                        </p>
                        <h3 className="text-white font-bold tracking-tighter text-2xl uppercase mb-4 leading-none">
                          {project.title}
                        </h3>
                        <p className="text-zinc-300 text-sm line-clamp-3 leading-relaxed mb-6">
                          {project.description}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedProject(project)}
                        className="group flex items-center gap-2 text-xs font-heading font-bold tracking-[0.2em] uppercase text-white hover:text-accent transition-colors w-fit"
                      >
                        View Details
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-accent hover:border-accent/30 transition-all hidden md:flex"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 border border-white/10 flex items-center justify-center text-white/50 hover:text-accent hover:border-accent/30 transition-all hidden md:flex"
          >
            <ChevronRight size={24} />
          </button>
        </motion.div>
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedProject(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl max-h-full bg-midnight border border-white/10 overflow-hidden flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white/50 hover:text-accent transition-colors"
              >
                <X size={24} />
              </button>

              {/* Modal Content - Left (Image) */}
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img
                  src={selectedProject.image_url || PLACEHOLDER_IMAGE}
                  alt={selectedProject.title}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = PLACEHOLDER_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent hidden md:block" />
              </div>

              {/* Modal Content - Right (Text) */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <p className="text-xs font-heading tracking-[0.3em] uppercase text-accent mb-2">
                  {selectedProject.category}
                </p>
                <h2 className="text-white font-bold tracking-tighter text-3xl md:text-4xl uppercase mb-6">
                  {selectedProject.title}
                </h2>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-heading tracking-[0.3em] uppercase text-white/30 mb-3">Overview</h4>
                    <p className="text-zinc-400 leading-relaxed">{selectedProject.description}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-heading tracking-[0.3em] uppercase text-white/30 mb-3">Process</h4>
                    <p className="text-zinc-400 leading-relaxed">{selectedProject.process}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] font-heading tracking-[0.3em] uppercase text-white/30 mb-3">Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tools.map((tool) => (
                          <span key={tool} className="px-2 py-1 bg-white/5 border border-white/10 text-[10px] font-heading uppercase tracking-widest text-white/60">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-heading tracking-[0.3em] uppercase text-white/30 mb-3">Results</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">{selectedProject.results}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <button className="btn-primary w-full md:w-auto">
                      <ExternalLink size={16} />
                      View Project
                    </button>
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
