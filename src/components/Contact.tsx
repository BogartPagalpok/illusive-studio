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
      } catch {}
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
        { name: form.name, email: form.email, message: form.message, user_id: user.id },
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

  return (
    <section className="section-padding relative overflow-visible z-30 bg-transparent">
      <div id="contact" className="absolute -top-20 left-0 w-full h-1 pointer-events-none" />
      
      <FloatingCube type="Canva" size={60} top="10%" left="5%" blur="2px" delay={0.5} duration={6} />
      <FloatingCube type="Id" size={90} bottom="10%" right="8%" blur="4px" delay={1.5} duration={9} />

      <div ref={ref} className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="section-subtitle !mb-3 font-black">{content.subtitle}</span>
            <h2 className="italic font-black uppercase tracking-tighter text-[var(--text-primary)]" style={{ fontSize: 'clamp(1.8rem, 4vw, 4rem)' }}>
              {content.heading.split(' ').length > 1 ? (
                <>
                  {content.heading.split(' ').slice(0, -1).join(' ')}{' '}
                  <span className="text-accent">{content.heading.split(' ').slice(-1)}</span>
                </>
              ) : (
                content.heading
              )}
            </h2>
            <p className="mt-4 mb-5 leading-relaxed text-[var(--text-secondary)]" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
              {content.description}
            </p>
            <div className="w-12 h-0.5 bg-[var(--accent)]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card-dark !p-5 !rounded-2xl w-full box-border"
            style={{ boxShadow: '0 15px 30px -8px rgba(0, 0, 0, 0.4)' }}
          >
            <div className="flex flex-col gap-1 mb-5">
              <p className="uppercase font-bold text-[var(--text-secondary)]/50" style={{ fontSize: 'clamp(8px, 0.8vw, 11px)', letterSpacing: '0.3em' }}>Secure Channel</p>
              {user && (
                <p className="text-accent uppercase font-black italic" style={{ fontSize: 'clamp(7px, 0.7vw, 10px)', letterSpacing: '0.2em' }}>
                  Authenticated: {user.email}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div className="w-full">
                <label className="block font-heading uppercase mb-1.5 ml-1 text-[var(--text-primary)]/60" style={{ fontSize: 'clamp(7px, 0.7vw, 10px)', letterSpacing: '0.2em' }}>NAME</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-dark" placeholder="Your Name"
                />
              </div>

              <div className="w-full">
                <label className="block font-heading uppercase mb-1.5 ml-1 text-[var(--text-primary)]/60" style={{ fontSize: 'clamp(7px, 0.7vw, 10px)', letterSpacing: '0.2em' }}>EMAIL</label>
                <input
                  type="email" required value={form.email} readOnly
                  className="input-dark cursor-not-allowed"
                />
              </div>

              <div className="w-full">
                <label className="block font-heading uppercase mb-1.5 ml-1 text-[var(--text-primary)]/60" style={{ fontSize: 'clamp(7px, 0.7vw, 10px)', letterSpacing: '0.2em' }}>MESSAGE</label>
                <textarea
                  required rows={3} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-dark resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              
              <button type="submit" disabled={sending} className="btn-primary w-full !py-3 !rounded-xl disabled:opacity-30 flex items-center justify-center gap-2 group">
                {sending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-t-transparent animate-spin rounded-full border-current" />
                    <span>SYNCING...</span>
                  </span>
                ) : sent ? (
                  <span className="font-black italic">TRANSMISSION COMPLETE</span>
                ) : (
                  <>
                    <Send size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span className="font-black italic tracking-widest">SEND MESSAGE</span>
                  </>
                )}
              </button>
            </form>

            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/5 blur-[40px] rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
