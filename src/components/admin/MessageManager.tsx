import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Mail, User, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function MessageManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('id, name, email, message, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      setMessages(messages.filter((m) => m.id !== id));
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-heading font-bold tracking-widest uppercase text-white">
          Client Messages ({messages.length})
        </h2>
        <button
          onClick={fetchMessages}
          className="text-[10px] font-heading tracking-widest uppercase text-white/40 hover:text-accent transition-colors"
        >
          Refresh
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl text-center">
          <Mail className="mx-auto mb-3 opacity-20" size={36} />
          <p className="text-xs font-heading tracking-wider uppercase text-white/40">No messages found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:border-accent/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-accent" />
                      <span className="text-xs font-heading font-bold uppercase tracking-wider text-white">{msg.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-accent" />
                      <span className="text-xs font-body text-white/60">{msg.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-accent" />
                      <span className="text-[10px] font-heading uppercase tracking-widest text-white/30">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded">
                    <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap font-body">{msg.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="p-2 text-white/20 hover:text-accent hover:bg-accent/10 transition-all rounded"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
