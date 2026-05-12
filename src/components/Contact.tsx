import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useScrollReveal } from '../hooks/useScrollReveal';
import FloatingCube from './FloatingCube';

interface ContactContent {
  subtitle: string;
  heading: string;
  description: string;
}

const defaultContent: ContactContent = {
  subtitle: "Let's Connect",
  heading: 'Get in Touch',
  description: "Have a project in mind or need a creative partner? I'd love to hear from you.",
};

export default function Contact() {
  const { ref, isVisible } = useScrollReveal();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [content, setContent] = useState<ContactContent>(defaultContent);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setForm(prev => ({ ...prev, email: session.user.email || '' }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setForm(prev => ({ ...prev, email: session.user.email || '' }));
      }
    });

    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'contact');

        if (!error && data && data.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of data) {
            const key = row.key as keyof ContactContent;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);
        }
      } catch {
        // Use defaults
      }
    };

    fetchContent();
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([
        { 
          name: form.name, 
          email: form.email, 
          message: form.message,
          user_id: user.id 
        },
      ]);
      if (error) throw error;
      setSent(true);
      setForm(prev => ({ ...prev, name: '', message: '' }));
      setTimeout(() => setSent(false), 4000);
    } catch (e: any) {
      console.error('Error sending message:', e.message);
      alert('Failed to send message. Please try again.');
    }
    setSending(false);
  };

  return (
    <section id="contact" className="section-padding bg-transparent relative overflow-hidden">
      {/* FIXED: Background and border stripped to allow global theme gradient */}
      
      <FloatingCube type="Canva" size={80} top="10%" left="5%" blur="2px" delay={0.5} duration={6} />
      <FloatingCube type="Id" size={120} bottom="10%" right="8%" blur="4px" delay={1.5} duration={9} />

      <div ref={ref} className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">
          {/* Left — Messaging */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:sticky lg:top-32"
          >
            <p className="text-sm font-heading tracking-[0.3em] uppercase text-accent mb-4">
              {content.subtitle}
            </p>
            {/* FIXED: Text color dynamic */}
            <h2 className="heading-lg text-[var(--text-primary)]">
              {content.heading.split(' ').length > 1 ? (
                <>
                  {content.heading.split(' ').slice(0, -1).join(' ')}{' '}
                  <span className="text-accent">{content.heading.split(' ').slice(-1)}</span>
                </>
              ) : (
                content.heading
              )}
            </h2>
            <p className="mt-6 mb-8 text-[var(--text-secondary)]">
              {content.description}
            </p>
            <div className="w-16 h-0.5 bg-accent" />
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="flex flex-col gap-1 mb-6">
              <p className="text-[10px] text-[var(--text-primary)] opacity-30 uppercase tracking-[0.2em]">Secure Channel</p>
              {user && (
                <p className="text-xs text-accent uppercase tracking-widest font-black">
                  Authenticated: {user.email}
                </p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-heading tracking-widest uppercase mb-2 text-[var(--text-secondary)]">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-heading tracking-widest uppercase mb-2 text-[var(--text-secondary)]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  readOnly
                  className="input-field opacity-60 cursor-not-allowed"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-heading tracking-widest uppercase mb-2 text-[var(--text-secondary)]">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field resize-none custom-scrollbar"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent)', backgroundImage: 'none' }}
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Sending...</span>
                  </span>
                ) : sent ? (
                  <span className="flex items-center justify-center">Message Sent!</span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Send size={16} className="-mt-0.5" />
                    <span>Send Message</span>
                  </span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
