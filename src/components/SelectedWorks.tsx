export default function SelectedWorks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0); // Track the current slide
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // ... (Keep your useEffect for fetching data)

  return (
    <section id="works" className="relative z-10 min-h-screen overflow-hidden flex items-center justify-center">
      
      {/* 1. DYNAMIC BACKGROUND LAYER (The Netflix Effect) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {projects.length > 0 && (
            <motion.div
              key={projects[activeIndex].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img 
                src={projects[activeIndex].image_url} 
                className="w-full h-full object-cover grayscale-[20%] brightness-[0.3]" 
                alt="background"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 w-full relative z-20">
        
        {/* 2. DYNAMIC DETAILS (Updates based on activeIndex) */}
        <div className="mb-12 h-40 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {projects.length > 0 && (
              <motion.div
                key={`text-${projects[activeIndex].id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <p className="text-accent text-[10px] tracking-[0.4em] uppercase font-black italic">
                  {projects[activeIndex].category}
                </p>
                <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">
                  {projects[activeIndex].title}
                </h2>
                <p className="max-w-xl text-white/60 text-sm leading-relaxed line-clamp-2 italic">
                  {projects[activeIndex].overview || projects[activeIndex].description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. THE CAROUSEL (The Controller) */}
        <div className="relative overflow-visible">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            onSlideChange={(s) => setActiveIndex(s.realIndex)} // Updates the background/details
            modules={[EffectCoverflow, Navigation]}
            effect="coverflow"
            centeredSlides={true}
            loop={projects.length > 2}
            speed={800}
            slidesPerView="auto"
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 150, modifier: 2.5, slideShadows: false }}
            className="!overflow-visible"
          >
            {projects.map((project) => (
              <SwiperSlide key={project.id} style={{ width: 'min(320px, 70vw)' }}>
                {({ isActive }) => (
                  <div className={`relative w-full aspect-[3/4] rounded-[30px] border transition-all duration-700 ${
                    isActive ? 'border-white/40 bg-white/10 scale-100 shadow-2xl' : 'border-white/5 opacity-40 scale-[0.8] grayscale'
                  }`}>
                    <img src={project.image_url} className="w-full h-full object-cover rounded-[28px]" alt={project.title} />
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
