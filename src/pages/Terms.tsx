import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
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
            Terms <span className="text-accent">&amp; Conditions</span>
          </h1>
          <p className="text-[10px] font-heading font-bold tracking-[0.2em] uppercase mb-12 text-white/40">
            Last Updated: May 2026
          </p>

          <div className="space-y-10 font-body text-sm md:text-base leading-relaxed text-white/70">
            <p>
              Welcome to the portfolio of Ian Lester Eclevia. By engaging my services as a Graphic Designer, Photographer, or Virtual Assistant, you agree to the following terms.
            </p>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">1. Services Provided</h2>
              <p>
                I provide digital graphic design, brand identity creation, photography, and virtual administrative support. The specific scope, deliverables, and timeline for each project will be outlined in a separate project agreement or invoice prior to commencement.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">2. Payment Terms</h2>
              <p>
                Unless otherwise agreed upon, a 50% non-refundable deposit is required before any design or photography work begins. The remaining 50% balance is due upon project completion, prior to the delivery of final high-resolution files or source files.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">3. Revisions</h2>
              <p>
                Design projects include a set number of revisions (typically 2-3 rounds) as specified in the project agreement. Additional revisions beyond the agreed scope will be billed at an hourly rate.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">4. Copyright &amp; Intellectual Property</h2>
              <p>
                Upon full payment, the client is granted the rights to use the final design deliverables for their intended purpose. However, I (Ian Lester Eclevia) retain the right to display all completed work, including preliminary drafts, in my personal portfolio, website, and social media for promotional purposes, unless a Non-Disclosure Agreement (NDA) is signed.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold tracking-widest uppercase mb-4 text-white">5. Limitation of Liability</h2>
              <p>
                I strive to provide high-quality work and reliable support. However, I am not liable for any indirect, incidental, or consequential damages, loss of profits, or business interruptions resulting from the use of my services or deliverables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
