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
    }
    setSending(false);
  };

  // Theme‑aware input base – uses the global glass variables
  const inputStyle = {
    backgroundColor: 'var(--glass-bg)',
    borderColor: 'var(--glass-border)',
    color: 'var(--text-primary)',
  };

  return (
    <section className="section-padding relative overflow-visible z-30 bg-transparent">
      <div id="contact" className="absolute -top-24 left-0 w-full h-1 pointer-events-none" />
      
      <FloatingCube type="Canva" size={80} top="10%" left="5%" blur="2px" delay={0.5} duration={6} />
      <FloatingCube type="Id" size={120} bottom="10%" right="8%" blur="4px" delay={1.5} duration={9} />

      <div ref={ref} className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">
          
          {/* Left – Messaging */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:sticky lg:top-32"
          >
            {/* Subtitle – uses global section-subtitle with size override */}
            <span className="section-subtitle !text-[10px] !tracking-[0.4em] !mb-4 font-black">
              {content.subtitle}
            </span>

            {/* Heading – keeps its unique italic style but uses theme text color */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl italic font-black uppercase tracking-tighter text-[var(--text-primary)]">
              {content.heading.split(' ').length > 1 ? (
                <>
                  {content.heading.split(' ').slice(0, -1).join(' ')}{' '}
                  <span className="text-accent">{content.heading.split(' ').slice(-1)}</span>
                </>
              ) : (
                content.heading
              )}
            </h2>

            <p className="mt-6 mb-8 leading-relaxed text-sm text-[var(--text-secondary)]">
              {content.description}
            </p>
            <div className="w-16 h-0.5 bg-[var(--accent)]" />
          </motion.div>

          {/* Right – Form Card (uses global card-glass, custom shadow & radius) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="card-glass rounded-[2.5rem]"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          >
            <div className="flex flex-col gap-1 mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--text-secondary)]/50">
                Secure Channel
              </p>
              {user && (
                <p className="text-[9px] text-accent uppercase tracking-[0.2em] font-black italic">
                  Authenticated: {user.email}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[9px] font-heading tracking-[0.2em] uppercase mb-2 ml-1 text-[var(--text-primary)]/60">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border rounded-xl p-4 outline-none focus:border-accent transition-all text-sm"
                  style={inputStyle}
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-[9px] font-heading tracking-[0.2em] uppercase mb-2 ml-1 text-[var(--text-primary)]/60">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  readOnly
                  className="w-full bg-transparent border rounded-xl p-4 outline-none opacity-40 cursor-not-allowed text-sm"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-[9px] font-heading tracking-[0.2em] uppercase mb-2 ml-1 text-[var(--text-primary)]/60">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-transparent border rounded-xl p-4 outline-none focus:border-accent transition-all text-sm resize-none custom-scrollbar"
                  style={inputStyle}
                  placeholder="Tell me about your project..."
                />
              </div>
              
              {/* Submit Button – now fully reliant on global btn-primary */}
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full py-5 !rounded-2xl disabled:opacity-30 flex items-center justify-center gap-3 group"
              >
                {sending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-t-transparent animate-spin rounded-full border-current" />
                    <span>SYNCING...</span>
                  </span>
                ) : sent ? (
                  <span className="font-black italic">TRANSMISSION COMPLETE</span>
                ) : (
                  <>
                    <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span className="font-black italic tracking-widest">SEND MESSAGE</span>
                  </>
                )}
              </button>
            </form>

            {/* Ambient glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-accent/5 blur-[50px] rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
