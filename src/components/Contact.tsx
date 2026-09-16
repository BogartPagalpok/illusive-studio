import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SendDuotone } from './icons/StreamlineIcons';
import { supabase } from '../lib/supabase';
import { formatSectionTitle } from '../lib/formatTitle';

gsap.registerPlugin(ScrollTrigger);

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
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [content, setContent] = useState<ContactContent>(defaultContent);

  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('section', 'contact')
          .eq('visible', true);
        if (!error && data && data.length > 0) {
          const mapped = { ...defaultContent };
          for (const row of data) {
            const key = row.key as keyof ContactContent;
            if (key in mapped) mapped[key] = row.value;
          }
          setContent(mapped);
        }
      } catch {
        // Fallback to default contact content
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'bottom 15%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'bottom 15%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // Step 1: Insert into Supabase (This triggers your Vercel Webhook)
      const { error } = await supabase.from('contact_messages').insert([
        { 
          name: form.name, 
          email: form.email, 
          message: form.message 
        },
      ]);
      
      if (error) throw error;
      
      setSent(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (e: any) {
      console.error('Error sending message:', e.message);
      alert("There was an issue sending your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section ref={sectionRef} className="section-padding relative overflow-visible z-30 bg-transparent">
      <div id="contact" className="absolute -top-20 left-0 w-full h-1 pointer-events-none" />

      <div className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
          
          <div
            ref={leftColRef}
            className="will-change-transform"
          >
            <span className="section-subtitle !mb-3 font-black">{content.subtitle}</span>
            <h2 className="section-title !text-left">
              {formatSectionTitle(content.heading)}
            </h2>
            <div className="w-12 h-0.5 bg-[var(--accent)] mt-4 mb-4" />
            <p className="mt-4 mb-5 leading-relaxed text-[var(--text-secondary)] text-sm sm:text-base font-body">
              {content.description}
            </p>
          </div>

          <div
            ref={rightColRef}
            className="card-dark w-full box-border will-change-transform"
            style={{ boxShadow: '0 15px 30px -8px rgba(0, 0, 0, 0.4)' }}
          >
            <div className="flex flex-col gap-1 mb-5">
              <p className="uppercase font-bold text-xs tracking-widest text-[var(--text-muted)] font-mono">
                Secure Channel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div className="w-full">
                <label className="block font-heading font-bold uppercase text-xs tracking-wider mb-2 ml-1 text-[var(--text-secondary)]">NAME</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-dark" placeholder="Your Name"
                />
              </div>

              <div className="w-full">
                <label className="block font-heading font-bold uppercase text-xs tracking-wider mb-2 ml-1 text-[var(--text-secondary)]">EMAIL</label>
                <input
                  type="email" required value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-dark cursor-text" placeholder="your@email.com"
                />
              </div>

              <div className="w-full">
                <label className="block font-heading font-bold uppercase text-xs tracking-wider mb-2 ml-1 text-[var(--text-secondary)]">MESSAGE</label>
                <textarea
                  required rows={3} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-dark resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              
              <button type="submit" disabled={sending} className="btn-primary w-full py-3.5 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 group text-xs font-black tracking-widest">
                {sending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-t-transparent animate-spin rounded-full border-current" />
                    <span>TRANSMITTING...</span>
                  </span>
                ) : sent ? (
                  <span className="font-black italic">TRANSMISSION COMPLETE</span>
                ) : (
                  <>
                    <SendDuotone
                      size={14}
                      primaryColor="var(--accent-contrast, #000000)"
                      secondaryColor="rgba(0, 0, 0, 0.25)"
                      className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                    <span className="font-black italic tracking-widest">SEND MESSAGE</span>
                  </>
                )}
              </button>
            </form>

            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/5 blur-[40px] rounded-full pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
