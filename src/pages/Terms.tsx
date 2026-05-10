import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-midnight">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-heading tracking-widest uppercase hover:text-accent transition-colors mb-12"
          style={{ color: 'var(--text-primary)', opacity: 0.4 }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>
          Terms &amp; Conditions
        </h1>
        <p className="text-sm font-heading tracking-wider uppercase mb-12" style={{ color: 'var(--text-primary)', opacity: 0.3 }}>
          Last Updated: May 2026
        </p>

        <div className="space-y-10 font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>
            Welcome to the portfolio of Ian Lester Eclevia. By engaging my services as a Graphic Designer, Photographer, or Virtual Assistant, you agree to the following terms.
          </p>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>1. Services Provided</h2>
            <p>
              I provide digital graphic design, brand identity creation, photography, and virtual administrative support. The specific scope, deliverables, and timeline for each project will be outlined in a separate project agreement or invoice prior to commencement.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>2. Payment Terms</h2>
            <p>
              Unless otherwise agreed upon, a 50% non-refundable deposit is required before any design or photography work begins. The remaining 50% balance is due upon project completion, prior to the delivery of final high-resolution files or source files.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>3. Revisions</h2>
            <p>
              Design projects include a set number of revisions (typically 2-3 rounds) as specified in the project agreement. Additional revisions beyond the agreed scope will be billed at an hourly rate.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>4. Copyright &amp; Intellectual Property</h2>
            <p>
              Upon full payment, the client is granted the rights to use the final design deliverables for their intended purpose. However, I (Ian Lester Eclevia) retain the right to display all completed work, including preliminary drafts, in my personal portfolio, website, and social media for promotional purposes, unless a Non-Disclosure Agreement (NDA) is signed.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>5. Limitation of Liability</h2>
            <p>
              I strive to provide high-quality work and reliable support. However, I am not liable for any indirect, incidental, or consequential damages, loss of profits, or business interruptions resulting from the use of my services or deliverables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
