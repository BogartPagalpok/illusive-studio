import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen relative bg-black overflow-hidden font-sans">
      {/* Background Glows for Glassmorphism Context */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[600px] pointer-events-none z-0 rounded-full mix-blend-screen"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(140px)', opacity: 0.15 }}
      />
      <div 
        className="absolute bottom-[20%] right-[-10%] w-[50%] h-[500px] pointer-events-none z-0 rounded-full mix-blend-screen"
        style={{ backgroundColor: 'var(--accent)', filter: 'blur(120px)', opacity: 0.1 }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-accent transition-colors mb-8 md:mb-12"
          style={{ color: 'var(--text-primary)', opacity: 0.6 }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Glassmorphism Container */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-14 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-wider uppercase mb-4 text-white">
            Privacy <span className="text-accent">Policy</span>
          </h1>
          <p className="text-[10px] font-heading font-bold tracking-[0.2em] uppercase mb-12 text-white/40">
            Last Updated: May 2026
          </p>

          <div className="space-y-10 font-body text-sm md:text-base leading-relaxed text-white/70">
            <p>
              Your privacy is important. This Privacy Policy explains how your information is collected, used, and protected when you visit this website or contact me for services.
            </p>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">1. Information Collection</h2>
              <p>
                I collect personal information that you voluntarily provide when you fill out the contact form on this website. This may include your Name, Email Address, Phone Number, and details regarding your project.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">2. How Information is Used</h2>
              <p className="mb-3">The information collected is used strictly to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-white/60">
                <li>Respond to your inquiries and provide customer support.</li>
                <li>Discuss project details, send proposals, and issue invoices.</li>
                <li>Deliver the requested Graphic Design, Photography, or Virtual Assistant services.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">3. Data Protection and Third Parties</h2>
              <p>
                Your information is stored securely (utilizing Supabase for database management). I do not sell, trade, or rent your personal information to third parties. Information is only shared if required by law or to facilitate the direct delivery of services to you.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">4. Contact Information</h2>
              <p className="mb-5">
                If you have any questions or concerns regarding this Privacy Policy or how your data is handled, please contact me directly:
              </p>
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-3">
                  <span className="font-heading font-black text-white/30 uppercase tracking-[0.2em] text-[10px] w-12">Email</span>
                  <a href="mailto:yhanlhester@gmail.com" className="text-accent hover:opacity-80 transition-opacity font-bold">
                    yhanlhester@gmail.com
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <span className="font-heading font-black text-white/30 uppercase tracking-[0.2em] text-[10px] w-12">Phone</span>
                  <a href="tel:8" className="text-accent hover:opacity-80 transition-opacity font-bold">
                    
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
