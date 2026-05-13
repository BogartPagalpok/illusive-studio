<Swiper
  onSwiper={(s) => { swiperRef.current = s; }}
  modules={[EffectCoverflow, Navigation, Pagination]}
  effect="coverflow"
  grabCursor={true}
  centeredSlides={true}
  loop={true}
  
  // 1. RESTORES YOUR CARD STYLE: Lets your CSS dictate the width
  slidesPerView="auto" 
  
  // 2. PREVENTS THE "CLUNK" ERROR: Dynamically matches your data
  loopedSlides={projects.length > 0 ? projects.length : 5} 
  
  navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
  
  // 3. KEEPS THE SMOOTH PHYSICS
  coverflowEffect={{ 
    rotate: 0,          // Keeps it flat and modern
    stretch: 0, 
    depth: 150,         // Keeps the smooth push-back depth
    modifier: 2.5, 
    slideShadows: true 
  }}
  speed={800}           // Keeps the glide
  className="!pb-24 !pt-10 overflow-visible coverflow-carousel"
>
