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

  useEffect(() => {
    fetchMessages();
  }, []);

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
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages(messages.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold tracking-widest uppercase text-white">
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
        <div className="card-dark text-center py-20 border-white/5">
          <Mail className="mx-auto mb-4 opacity-20" size={48} />
          <p className="font-heading tracking-wider uppercase text-white/40">
            No messages found
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-dark border-white/5 p-6 group hover:border-accent/30 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-accent" />
                      <span className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                        {msg.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-accent" />
                      <span className="text-sm font-body text-white/60">
                        {msg.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-accent" />
                      <span className="text-[10px] font-heading uppercase tracking-widest text-white/30">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-none">
                    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap font-body">
                      {msg.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(msg.id)}
                  className="p-3 text-white/20 hover:text-accent hover:bg-accent/10 transition-all rounded-none self-end md:self-start"
                  title="Delete message"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
