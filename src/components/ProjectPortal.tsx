import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface ShoeVariant {
  id: string;
  title: string;
  colorName: string;
  colorHex: string;
  url: string;
  bgImage: string;
  shoeImage: string;
  routingPath: string;
  audience: string;
  conversionFocus: string;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
}

export default function ProjectPortal() {
  const [activeShoe, setActiveShoe] = useState<ShoeVariant | null>(null);
  const [isShowroomVisible, setIsShowroomVisible] = useState(true);
  
  // NEW: State to control when the iframe is actually clickable
  const [interactiveMode, setInteractiveMode] = useState(false);

  // Reset interactive mode every time they pick a new shoe
  useEffect(() => {
    setInteractiveMode(false);
  }, [activeShoe]);

  useEffect(() => {
    const fetchVisibility = async () => {
      const sectionResult = await supabase
        .from('portfolio_sections')
        .select('visible')
        .eq('key', 'growth-marketing-study')
        .maybeSingle();
      if (!sectionResult.error && sectionResult.data) {
        setIsShowroomVisible(sectionResult.data.visible);
        return;
      }

      let { data, error } = await supabase
        .from('site_content')
        .select('visible, value')
        .eq('section', 'works')
        .eq('key', 'shoes_showroom_visible')
        .maybeSingle();
      if (error) {
        const legacy = await supabase
          .from('site_content')
          .select('value')
          .eq('section', 'works')
          .eq('key', 'shoes_showroom_visible')
          .maybeSingle();
        data = legacy.data;
      }
      if (data) setIsShowroomVisible(data.visible ?? data.value !== 'false');
    };
    fetchVisibility();
  }, []);

  const dynamicShoes: ShoeVariant[] = [
    {
      id: 'blue',
      title: 'ZoomX Blue',
      colorName: 'Ocean Surge',
      colorHex: '#00d2ff',
      url: 'https://demo-6py.pages.dev/?color=blue',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/blue.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_blue.png',
      routingPath: '/v1/blue-surge',
      audience: 'Cold Traffic',
      conversionFocus: 'Brand Awareness',
      primaryMetricLabel: 'CPM',
      primaryMetricValue: '$4.50',
      secondaryMetricLabel: 'Impressions',
      secondaryMetricValue: '1.2M'
    },
    {
      id: 'cherry',
      title: 'Air Cherry',
      colorName: 'Cherry Bomb',
      colorHex: '#ff0055',
      url: 'https://demo-6py.pages.dev/?color=cherry',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/cherry.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_cherry.png',
      routingPath: '/v1/cherry-bomb',
      audience: 'Retargeting',
      conversionFocus: 'Direct Sale',
      primaryMetricLabel: 'ROAS',
      primaryMetricValue: '4.8x',
      secondaryMetricLabel: 'CPA',
      secondaryMetricValue: '$12.50'
    },
    {
      id: 'green',
      title: 'Alphafly Proto',
      colorName: 'Volt Energy',
      colorHex: '#ccff00',
      url: 'https://demo-6py.pages.dev/?color=volt',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/green.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_green.png',
      routingPath: '/v1/volt-elite',
      audience: 'Performance',
      conversionFocus: 'Lead Gen',
      primaryMetricLabel: 'CPL',
      primaryMetricValue: '$8.20',
      secondaryMetricLabel: 'Leads Gen',
      secondaryMetricValue: '850'
    },
    {
      id: 'purple',
      title: 'Air Max Dn',
      colorName: 'Dynamic Purple',
      colorHex: '#8a2be2',
      url: 'https://demo-6py.pages.dev/?color=purple',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/purple.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_purple.png',
      routingPath: '/v1/dn-lifestyle',
      audience: 'Gen Z/Culture',
      conversionFocus: 'Engagement',
      primaryMetricLabel: 'CTR',
      primaryMetricValue: '3.5%',
      secondaryMetricLabel: 'Cost Per Click',
      secondaryMetricValue: '$0.45'
    },
    {
      id: 'red',
      title: 'Air Zoom Red',
      colorName: 'Chili Red',
      colorHex: '#e60000',
      url: 'https://demo-6py.pages.dev/?color=red',
      bgImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/red.png',
      shoeImage: 'https://raw.githubusercontent.com/BogartPagalpok/illusive-studio/main/public/shoe_red.png',
      routingPath: '/v1/infra-red',
      audience: 'Sneakerheads',
      conversionFocus: 'High Conversion',
      primaryMetricLabel: 'CPA',
      primaryMetricValue: '$18.00',
      secondaryMetricLabel: 'Conv. Rate',
      secondaryMetricValue: '3.2%'
    }
  ];

  const marqueeShoes = [...dynamicShoes, ...dynamicShoes, ...dynamicShoes];

  if (!isShowroomVisible) return null;

  // NEW: The Activation Overlay Component
  const ActivateOverlay = () => (
    <AnimatePresence>
      {!interactiveMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setInteractiveMode(true)}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group"
        >
          <div className="flex flex-col items-center justify-center p-6 bg-black/80 border border-white/20 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-2xl">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: activeShoe?.colorHex || 'white' }}>
              <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-white font-black tracking-widest uppercase text-sm mb-2">Live Prototype</span>
            <span className="text-white/70 text-xs text-center font-medium max-w-[220px]">
              Click to explore features, watch videos, and test the checkout flow.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <section id="works" className="w-full min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative z-10 bg-transparent overflow-hidden select-none">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .shoe-float {
          animation: floatBounce 4s ease-in-out infinite;
        }
        .fade-edges {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
      `}} />

      <AnimatePresence mode="wait">
        {!activeShoe ? (
          <motion.div
            key="selection-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center justify-center min-h-[700px]"
          >
            {/* Context Header */}
            <div className="text-center mb-16 lg:mb-24 flex flex-col items-center px-4">
              <span className="text-[clamp(0.75rem,1vw,0.875rem)] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
                Growth Marketing Case Study
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] uppercase mb-6">
                Modular Creative Testing
              </h2>
              <div className="w-12 h-[2px] bg-[var(--accent)] mb-6" />
              <p className="max-w-2xl text-center text-[clamp(0.875rem,1vw,1rem)] text-[var(--text-secondary)] leading-relaxed">
                This interactive portal demonstrates a modern Meta Ads testing strategy. Select a variant below to explore how we use visual hooks as targeting filters, aligning each colorway with specific audience segments, post-click landing pages, and campaign performance metrics.
              </p>
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden lg:grid grid-cols-5 gap-6 xl:gap-8 max-w-[1600px] w-full px-8">
              {dynamicShoes.map((shoe) => (
                <button
                  key={`desktop-${shoe.id}`}
                  onClick={() => setActiveShoe(shoe)}
                  className="group relative flex flex-col items-center justify-start w-full outline-none"
                >
                  <div className="relative w-full aspect-square flex items-center justify-center mb-6">
                    <img src={shoe.bgImage} alt={`${shoe.title} Background`} className="absolute inset-0 w-full h-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105" />
                    <img src={shoe.shoeImage} alt={shoe.title} className="absolute z-10 w-[90%] h-auto object-contain shoe-float drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-105" style={{ top: '0%', left: '5%' }} />
                  </div>
                  <h4 className="text-[clamp(0.875rem,1vw,1rem)] font-black text-[var(--text-primary)] uppercase tracking-wider transition-transform duration-500 group-hover:-translate-y-2 text-center">{shoe.title}</h4>
                  <span className="text-[clamp(0.75rem,1vw,0.875rem)] font-bold uppercase tracking-widest mt-1 transition-transform duration-500 group-hover:-translate-y-2 text-center" style={{ color: shoe.colorHex }}>{shoe.colorName}</span>

                  <div className="mt-4 w-full text-left space-y-1.5 border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center text-[clamp(0.75rem,1vw,0.875rem)] uppercase tracking-widest text-[var(--text-secondary)]">
                      <span>Target</span><span className="text-[var(--text-primary)] font-bold">{shoe.audience}</span>
                    </div>
                    <div className="flex justify-between items-center text-[clamp(0.75rem,1vw,0.875rem)] uppercase tracking-widest text-[var(--text-secondary)]">
                      <span>Goal</span><span className="text-[var(--text-primary)] font-bold">{shoe.conversionFocus}</span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                      <div className="flex justify-between items-center text-[clamp(0.75rem,1vw,0.875rem)] uppercase tracking-widest text-[var(--text-secondary)]">
                        <span>{shoe.primaryMetricLabel}</span><span className="font-mono font-bold" style={{ color: shoe.colorHex }}>{shoe.primaryMetricValue}</span>
                      </div>
                      <div className="flex justify-between items-center text-[clamp(0.75rem,1vw,0.875rem)] uppercase tracking-widest text-[var(--text-secondary)]">
                        <span>{shoe.secondaryMetricLabel}</span><span className="font-mono text-[var(--text-primary)] font-bold">{shoe.secondaryMetricValue}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* MOBILE VIEW MARQUEE */}
            <div className="flex lg:hidden w-full overflow-visible relative py-12 fade-edges">
              <motion.div
                className="flex gap-12 w-max cursor-grab active:cursor-grabbing px-8"
                animate={{ x: ["-50%", "0%"] }}
                transition={{ ease: "linear", duration: 25, repeat: Infinity }}
              >
                {marqueeShoes.map((shoe, idx) => (
                  <button
                    key={`mobile-${shoe.id}-${idx}`}
                    onClick={() => setActiveShoe(shoe)}
                    className="flex flex-col items-center justify-center w-[220px] shrink-0 group focus:outline-none"
                  >
                    <div className="relative w-full aspect-square flex items-center justify-center mb-4">
                      <img src={shoe.bgImage} alt={`${shoe.title} Background`} className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                      <img src={shoe.shoeImage} alt={shoe.title} className="absolute z-10 w-[90%] h-auto object-contain shoe-float drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)]" style={{ top: '0%', left: '5%' }} />
                    </div>
                    <h4 className="text-[clamp(0.875rem,1vw,1rem)] font-black text-[var(--text-primary)] uppercase tracking-wider">{shoe.title}</h4>
                    <span className="text-[clamp(0.75rem,1vw,0.875rem)] font-bold uppercase tracking-widest mt-1" style={{ color: shoe.colorHex }}>{shoe.colorName}</span>
                  </button>
                ))}
              </motion.div>
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
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 px-2">
              <div>
                <span className="text-[clamp(0.75rem,1vw,0.875rem)] font-black tracking-[0.4em] uppercase" style={{ color: activeShoe.colorHex }}>
                  Campaign Live Portal &rarr; {activeShoe.colorName}
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">Match Verification Frame</h3>
              </div>
              <button
                onClick={() => setActiveShoe(null)}
                className="px-6 py-3 border border-[var(--text-secondary)] text-[var(--text-secondary)] bg-transparent hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200"
              >
                &larr; Back To Selection
              </button>
            </div>

            <div className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
              <div className="flex-1 space-y-3 z-10">
                <h4 className="text-[clamp(0.75rem,1vw,0.875rem)] font-black tracking-widest uppercase text-[var(--text-secondary)]">Growth Strategy Analysis</h4>
                <div className="text-[clamp(0.75rem,1vw,0.875rem)] text-[var(--text-primary)] leading-relaxed space-y-1">
                  <p><span style={{ color: activeShoe.colorHex }} className="font-bold uppercase tracking-wider">Hypothesis:</span> Testing modular visual hooks against distinct audience segments using Meta Advantage+.</p>
                  <p><span style={{ color: activeShoe.colorHex }} className="font-bold uppercase tracking-wider">Execution:</span> Deployed rapid UI variations to isolate which creative acted as the best targeting filter.</p>
                  <p><span style={{ color: activeShoe.colorHex }} className="font-bold uppercase tracking-wider">Result:</span> Scaled budget safely while achieving a <span className="font-mono font-bold">{activeShoe.primaryMetricValue} {activeShoe.primaryMetricLabel}</span>.</p>
                </div>
              </div>
              
              <div className="w-full md:w-72 h-24 border border-white/10 rounded-xl relative overflow-hidden bg-black/40 p-3 flex flex-col justify-end z-10 shrink-0">
                <div className="absolute top-3 left-4 flex justify-between w-[calc(100%-2rem)]">
                   <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">CPA Trend Optimization</span>
                   <span className="text-[10px] font-mono text-green-400 font-bold">-22%</span>
                </div>
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <path d="M0,35 Q20,35 40,25 T80,10 T100,5" fill="none" stroke={activeShoe.colorHex} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  <circle cx="100" cy="5" r="3" fill={activeShoe.colorHex} />
                </svg>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.95fr_1fr] gap-6 xl:gap-8 items-center justify-center">
              
              {/* Desktop Frame */}
              <div className="hidden lg:flex flex-col w-full h-[760px] bg-[var(--bg-secondary)] rounded-2xl p-3.5 border border-[var(--glass-border)] shadow-2xl relative">
                <div className="absolute top-4 left-6 flex gap-1.5 z-30 pointer-events-none">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="w-full h-8 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] border-b border-white/5 uppercase tracking-widest mb-2 bg-[var(--glass-bg)] rounded-t-lg pointer-events-none">
                  Desktop Live Context
                </div>
                <div className="w-full h-full rounded-xl overflow-hidden border border-[var(--glass-border)] bg-black relative group">
                  
                  {/* The iframe handles pointer events based on interactiveMode */}
                  <iframe 
                    src={activeShoe.url} 
                    className={`w-full h-full border-0 bg-black transition-opacity duration-300 ${interactiveMode ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-50'}`} 
                    title="Desktop Showroom Frame" 
                  />
                  
                  {/* The new Activate Overlay */}
                  <ActivateOverlay />
                </div>
              </div>

              {/* Mobile Frame */}
              <div className="flex justify-center items-center w-full h-[760px]">
                <div className="relative w-full max-w-[360px] h-[740px] bg-[var(--bg-secondary)] rounded-[50px] p-4 border-[4px] border-[var(--glass-border)] shadow-2xl ring-4 ring-black">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-50 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-1 bg-neutral-800 rounded-full" />
                  </div>
                  
                  <div className="w-full h-full rounded-[36px] overflow-hidden border border-black bg-black relative group">
                    <iframe 
                      src={activeShoe.url} 
                      className={`w-full h-full border-0 absolute inset-0 bg-black transition-opacity duration-300 ${interactiveMode ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-50'}`} 
                      title="Mobile Showroom Frame" 
                    />
                    
                    {/* The new Activate Overlay */}
                    <ActivateOverlay />
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
