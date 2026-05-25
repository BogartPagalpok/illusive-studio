import { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export default function ProjectPortal() {
  // 'desktop' or 'mobile' view state
  const [frameMode, setFrameMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // The live live link you just deployed
  const targetUrl = "https://demo-6py.pages.dev/";

  return (
    <section className="w-full min-h-screen bg-[#0e0e0e] py-16 px-4 flex flex-col items-center justify-center">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-wider text-white uppercase">Interactive Concept Lab</h2>
        <p className="text-sm text-neutral-500 mt-2">Switch frames to test mobile touch gestures or desktop scroll mechanics live.</p>
      </div>

      {/* Frame Switcher Control Bar */}
      <div className="flex bg-neutral-900 p-1.5 rounded-xl border border-neutral-800 gap-2 mb-8 z-10 shadow-lg">
        <button
          onClick={() => setFrameMode('desktop')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            frameMode === 'desktop'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Monitor size={14} />
          Desktop View
        </button>
        <button
          onClick={() => setFrameMode('mobile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            frameMode === 'mobile'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Smartphone size={14} />
          Mobile Frame
        </button>
      </div>

      {/* Responsive Live Portal Engine Container */}
      <div className="w-full flex items-center justify-center transition-all duration-500 ease-in-out">
        {frameMode === 'desktop' ? (
          /* Desktop Simulated Monitor Frame */
          <div className="w-full max-w-5xl h-[650px] bg-neutral-900 rounded-2xl p-3 border border-neutral-800 shadow-2xl transition-all duration-500">
            <div className="w-full h-full rounded-lg overflow-hidden border border-neutral-950 bg-black">
              <iframe 
                src={targetUrl} 
                className="w-full h-full border-0 select-none"
                title="Nike Demo Desktop Portal"
              />
            </div>
          </div>
        ) : (
          /* Mobile Simulated iPhone Frame */
          <div className="relative w-[360px] h-[740px] bg-neutral-900 rounded-[50px] p-3.5 border-[4px] border-neutral-800 shadow-2xl transition-all duration-500 ring-4 ring-neutral-950">
            {/* iPhone Speaker Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-neutral-950 rounded-full z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-neutral-800 rounded-full" />
            </div>
            
            {/* Display screen area inside the mobile frame */}
            <div className="w-full h-full rounded-[38px] overflow-hidden border border-neutral-950 bg-black">
              <iframe 
                src={targetUrl} 
                className="w-full h-full border-0 select-none"
                title="Nike Demo Mobile Portal"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
