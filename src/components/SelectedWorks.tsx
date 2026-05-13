**Here's the updated code** with a much stronger, more premium 3D carousel effect (closer to the references you showed):

```tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { supabase } from '../lib/supabase';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

export default function SelectedWorks() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

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
          const cleanTitle = item.title.replace(/\.[^/.]+$/, "").trim();
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
    <section id="works" className="relative z-40 bg-transparent min-h-[120vh] py-20 flex flex-col justify-center">
      <div className="max-w-[1600px] mx-auto px-4 w-full relative z-20">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-accent mb-2">Selected Portfolio</p>
          <h2 className="text-6xl md:text-8xl font-bold text-white uppercase tracking-tighter leading-none">Works</h2>
        </div>

        <div className="relative group">
          <Swiper
            onSwiper={(s) => (swiperRef.current = s)}
            modules={[EffectCoverflow, Navigation]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            slidesPerView="auto"
            speed={700}
            navigation={{
              nextEl: '.nav-next',
              prevEl: '.nav-prev',
            }}
            coverflowEffect={{
              rotate: 12,        // Slight tilt (like the references)
              stretch: 0,
              depth: 280,
              modifier: 2.2,     // Stronger 3D effect
              slideShadows: true,
            }}
            className="!overflow-visible !py-12"
          >
            {projects.map((project) => (
              <SwiperSlide 
                key={project.id} 
                style={{ width: '380px' }} 
                className="md:!w-[420px]"
              >
                <div 
                  onClick={() => setSelectedProject(project)}
                  className="relative w-full h-[560px] md:h-[680px] rounded-[40px] overflow-hidden 
                             border border-white/10 bg-white/5 cursor-pointer group/card
                             shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                >
                  <img 
                    src={project.image_url} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    alt={project.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-10 z-10">
                    <span className="text-accent text-xs tracking-[3px] font-medium">
                      {project.category}
                    </span>
                    <h3 className="text-white text-4xl md:text-5xl font-bold tracking-tighter mt-3 leading-none">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button className="nav-prev absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/70 border border-white/20 text-white hover:bg-white hover:text-black transition-all hidden xl:block">
            <ChevronLeft size={28} />
          </button>
          <button className="nav-next absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/70 border border-white/20 text-white hover:bg-white hover:text-black transition-all hidden xl:block">
            <ChevronRight size={28} />
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 p-4">
            <button 
              onClick={() => setSelectedProject(null)} 
              className="absolute top-8 right-8 text-white/70 hover:text-white z-[100]"
            >
              <X size={32} />
            </button>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-w-6xl w-full flex flex-col md:flex-row gap-10 items-center"
            >
              <img 
                src={selectedProject.image_url} 
                className="w-full md:w-[55%] rounded-3xl shadow-2xl" 
                alt="" 
              />
              <div className="text-white md:w-[45%]">
                <span className="text-accent tracking-widest text-sm">{selectedProject.category}</span>
                <h2 className="text-6xl font-bold tracking-tighter mt-4 mb-6">{selectedProject.title}</h2>
                <p className="text-xl text-white/70">{selectedProject.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
```

### Key Changes Made:

- **`rotate: 12`** + **`modifier: 2.2`** → Gives that nice angled 3D depth you see in the references
- **`slideShadows: true`** → Adds subtle shadows between cards
- Removed `Pagination` (cleaner look)
- Improved card styling (better shadows, hover effect, rounded corners)
- Cleaner modal animation

Would you like a version with **even stronger perspective** (more like the phone mockup image) or the current one is good?
