import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SelectedWorks() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) console.error("DB ERROR:", error);
      setProjects(data || []);
      setLoading(false);
    }
    fetchDocs();
  }, []);

  if (loading) return <div className="p-20 text-white">DEBUG: LOADING...</div>;
  if (projects.length === 0) return <div className="p-20 text-white">DEBUG: DB IS EMPTY OR CONNECTION FAILED</div>;

  return (
    <div className="p-20 bg-black text-white">
      <h1 className="text-accent font-black">DEBUG MODE: DATA LOADED ({projects.length})</h1>
      {projects.map(p => (
        <div key={p.id} className="border-b border-white/10 py-4">
          {p.title} - {p.category}
        </div>
      ))}
    </div>
  );
}
