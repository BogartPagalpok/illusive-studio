import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
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
          Privacy Policy
        </h1>
        <p className="text-sm font-heading tracking-wider uppercase mb-12" style={{ color: 'var(--text-primary)', opacity: 0.3 }}>
          Last Updated: May 2026
        </p>

        <div className="space-y-10 font-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p>
            Your privacy is important. This Privacy Policy explains how your information is collected, used, and protected when you visit this website or contact me for services.
          </p>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>1. Information Collection</h2>
            <p>
              I collect personal information that you voluntarily provide when you fill out the contact form on this website. This may include your Name, Email Address, Phone Number, and details regarding your project.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>2. How Information is Used</h2>
            <p className="mb-3">The information collected is used strictly to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Respond to your inquiries and provide customer support.</li>
              <li>Discuss project details, send proposals, and issue invoices.</li>
              <li>Deliver the requested Graphic Design, Photography, or Virtual Assistant services.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>3. Data Protection and Third Parties</h2>
            <p>
              Your information is stored securely (utilizing Supabase for database management). I do not sell, trade, or rent your personal information to third parties. Information is only shared if required by law or to facilitate the direct delivery of services to you.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-primary)' }}>4. Contact Information</h2>
            <p className="mb-3">
              If you have any questions or concerns regarding this Privacy Policy or how your data is handled, please contact me directly:
            </p>
            <p>
              Email:{' '}
              <a href="mailto:yhanlhester@gmail.com" className="text-accent hover:opacity-80 transition-opacity">
                yhanlhester@gmail.com
              </a>
            </p>
            <p>
              Phone:{' '}
              <a href="tel:8" className="text-accent hover:opacity-80 transition-opacity">
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
