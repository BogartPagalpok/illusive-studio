import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShoeVariant {
  id: string;
  title: string;
  colorName: string;
  colorHex: string;
  url: string;
  bgImage: string;
  shoeImage: string;
}

export default function ProjectPortal() {
  const [activeShoe, setActiveShoe] = useState<ShoeVariant | null>(null);

  // Mapped all 5 shoes utilizing your exact GitHub repo asset filenames
  // Compositing the background card with the isolated bouncing shoe
  const dynamicShoes: ShoeVariant[] = [
    {
      id: 'blue',
      title: 'ZoomX Blue',
      colorName: 'Ocean Surge',
      colorHex: '#00d2ff',
      url: 'https://demo-6py.pages.dev/?color=blue',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/blue.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_blue.png'
    },
    {
      id: 'cherry',
      title: 'Air Cherry',
      colorName: 'Cherry Bomb',
      colorHex: '#ff0055',
      url: 'https://demo-6py.pages.dev/?color=cherry',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/cherry.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_cherry.png'
    },
    {
      id: 'green',
      title: 'Alphafly Proto',
      colorName: 'Volt Energy',
      colorHex: '#ccff00',
      url: 'https://demo-6py.pages.dev/?color=volt',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/green.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_green.png'
    },
    {
      id: 'purple',
      title: 'Air Max Dn',
      colorName: 'Dynamic Purple',
      colorHex: '#8a2be2',
      url: 'https://demo-6py.pages.dev/?color=purple',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/purple.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_purple.png'
    },
    {
      id: 'red',
      title: 'Air Zoom Red',
      colorName: 'Chili Red',
      colorHex: '#e60000',
      url: 'https://demo-6py.pages.dev/?color=red',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/red.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_red.png'
    }
  ];

  const imageWidth = 260;
  const imageHeight = 340;
  const translateZ = 380; 
  const spreadAngle = 360 / dynamicShoes.length;

  return (
    <section className="w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative z-10 bg-[#060606] overflow-hidden select-none">
      
      <style>{`
        @keyframes rotation {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0px) rotate(-8deg) scale(1.1); }
          50% { transform: translateY(-16px) rotate(-8deg) scale(1.1); }
        }
        .carousel-container {
          perspective: 1600px;
          overflow: visible;
        }
        /* Slowed to 40s, hover pause removed per your instructions */
        .carousel-3d {
          transform-style: preserve-3d;
          transform-origin: center center;
          animation: rotation 40s infinite linear;
        }
        .carousel-item {
          position: absolute;
          margin: 0;
          top: 50%;
          left: 50%;
          transform-origin: center center;
          transform-style: preserve-3d;
          backface-visibility: hidden; /* Hides the mirrored back view completely on the far side of the orbit */
        }
        .shoe-float {
          animation: floatBounce 4s ease-in-out infinite;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {!activeShoe ? (
          /* STATE 1: 3D ROTATING CAROUSEL VIEWPORT */
          <motion.div
            key="carousel-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center justify-center min-h-[700px]"
          >
            <div className="text-center mb-32">
              <span className="text-xs font-black tracking-[0.4em] text-white/50 uppercase">Interactive Showroom</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase mt-1">Select A Variant</h2>
            </div>

            <div className="carousel-container relative w-full max-w-5xl h-[400px] flex items-center justify-center">
              <div className="carousel-3d w-full h-full relative flex items-center justify-center">
                {dynamicShoes.map((shoe, index) => {
                  const angle = index * spreadAngle;
                  const transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${translateZ}px)`;

                  return (
                    <figure
                      key={shoe.id}
                      className="carousel-item group cursor-pointer"
                      style={{ width: imageWidth, height: imageHeight, transform }}
                      onClick={() => setActiveShoe(shoe)}
                    >
                      {/* OPAQUE CARD BACKGROUND: Blocks mirrored text from showing through */}
                      <div 
                        className="relative w-full h-full rounded-[32px] border border-white/10 bg-[#0a0a0a] overflow-hidden transition-all duration-500 group-hover:border-white/30 group-hover:-translate-y-4"
                        style={{ boxShadow: `0 20px 40px rgba(0,0,0,0.8)` }}
                      >
                        
                        {/* Hover Glow Effect Hook */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-2xl z-0"
                          style={{ backgroundColor: shoe.colorHex }}
                        />

                        {/* Static Card Background Image */}
                        <img 
                          src={shoe.bgImage} 
                          alt="Card Background" 
                          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen z-10 transition-opacity duration-500 group-hover:opacity-70"
                        />
                        
                        {/* Floating Bouncing Shoe Image composited on top */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                          <img 
                            src={shoe.shoeImage} 
                            alt={shoe.title} 
                            className="w-full h-auto object-contain shoe-float drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
                          />
                        </div>

                        {/* Typography Layer */}
                        <div className="absolute bottom-0 left-0 w-full p-6 z-30 bg-gradient-to-t from-black via-black/80 to-transparent">
                          <h4 className="text-[14px] font-black text-white uppercase tracking-wider">{shoe.title}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-widest mt-1 block" style={{ color: shoe.colorHex }}>
                            {shoe.colorName}
                          </span>
                        </div>
                      </div>
                    </figure>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* STATE 2: AD CONVERSION LIVE PORTAL */
          <motion.div
            key="portal-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col max-w-[1800px]"
          >
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-2">
              <div>
                <span className="text-xs font-black tracking-[0.4em] uppercase" style={{ color: activeShoe.colorHex }}>
                  Campaign Live Portal &rarr; {activeShoe.colorName}
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Match Verification Frame</h3>
              </div>
              <button
                onClick={() => setActiveShoe(null)}
                className="px-6 py-3 border border-neutral-800 text-neutral-400 bg-transparent hover:bg-neutral-900 hover:text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200"
              >
                &larr; Back To Carousel
              </button>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.95fr_1fr] gap-6 xl:gap-8 items-center justify-center">
              
              {/* DESKTOP WEB PORTAL FRAME */}
              <div className="hidden lg:flex flex-col w-full h-[760px] bg-neutral-900 rounded-2xl p-3.5 border border-neutral-800 shadow-2xl relative">
                <div className="absolute top-4 left-6 flex gap-1.5 z-30">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="w-full h-8 flex items-center justify-center text-[10px] font-bold text-neutral-500 border-b border-neutral-800/40 uppercase tracking-widest mb-2 bg-neutral-950/20 rounded-t-lg">
                  Desktop Live Context
                </div>
                <div className="w-full h-full rounded-xl overflow-hidden border border-neutral-950 bg-black">
                  <iframe src={activeShoe.url} className="w-full h-full border-0 select-none bg-black" title="Desktop Showroom Frame" />
                </div>
              </div>

              {/* MOBILE PHONE PORTAL FRAME */}
              <div className="flex justify-center items-center w-full h-[760px]">
                <div 
                  className="relative w-full max-w-[360px] h-[740px] bg-neutral-900 rounded-[50px] p-4 border-[4px] border-neutral-800 shadow-2xl ring-4 ring-neutral-950 overscroll-contain"
                  style={{ touchAction: 'auto' }}
                >
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-neutral-950 rounded-full z-50 flex items-center justify-center">
                    <div className="w-12 h-1 bg-neutral-800 rounded-full" />
                  </div>
                  
                  <div className="w-full h-full rounded-[36px] overflow-hidden border border-neutral-950 bg-black relative">
                    <iframe 
                      src={activeShoe.url} 
                      className="w-full h-full border-0 absolute inset-0 bg-black" 
                      title="Mobile Showroom Frame" 
                    />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
