<div className="relative w-full max-w-[100vw] px-12 group">
          <Swiper
            onSwiper={(s) => { swiperRef.current = s; }}
            // 1. SWITCH TO STANDARD SLIDE (Kills the "Slim" look)
            grabCursor={true}
            centeredSlides={false}
            loop={false}
            // 2. PREVENT DRAG FROM STEALING CLICKS
            preventClicks={true}
            preventClicksPropagation={true}
            slideToClickedSlide={false}
            touchReleaseOnEdges={true}
            // 3. ADD NAVIGATION ARROWS
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
                  className="h-full w-full rounded-3xl border overflow-hidden group/card relative backdrop-blur-[32px] saturate-[180%]"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                    borderColor: 'rgba(255, 255, 255, 0.12)',
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
                    
                    {/* FIXED: Increased z-index to ensure it captures the click */}
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
          <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-accent hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block">
            <ChevronLeft size={30} />
          </button>
          <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-accent hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block">
            <ChevronRight size={30} />
          </button>
        </div>
