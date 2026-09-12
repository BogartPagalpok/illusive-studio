import React, { useRef, useState } from 'react';
import { X, Film, Upload, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { usePortfolioStore } from '../../lib/store';

interface DualShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DualShowreelModal({ isOpen, onClose }: DualShowreelModalProps) {
  const { dualShowreel, updateDualShowreelCard, uploadWebmFile } = usePortfolioStore();

  const [uploadingEssay, setUploadingEssay] = useState(false);
  const [uploadingGaming, setUploadingGaming] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const essayFileInputRef = useRef<HTMLInputElement>(null);
  const gamingFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (card: 'essay' | 'gaming', file: File) => {
    if (card === 'essay') setUploadingEssay(true);
    else setUploadingGaming(true);

    try {
      const publicUrl = await uploadWebmFile(file);
      if (publicUrl) {
        updateDualShowreelCard(card, 'webm_url', publicUrl);
        setStatusMsg(`Uploaded ${file.name} successfully!`);
      } else {
        setStatusMsg('Upload failed. Please verify storage permissions or paste URL directly.');
      }
    } catch {
      setStatusMsg('Upload failed. Paste URL directly.');
    } finally {
      if (card === 'essay') setUploadingEssay(false);
      else setUploadingGaming(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0B0C10]/95 backdrop-blur-2xl shadow-2xl p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film className="text-accent" size={20} />
              <h2 className="text-lg font-heading font-black tracking-widest uppercase text-white">
                DUAL SHOWREEL CONFIGURATION
              </h2>
            </div>
            <p className="text-[11px] font-mono tracking-wider text-white/50 uppercase">
              Control hover loops, YouTube video modals, and placeholder states
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} />
            {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GROUP 1: Video Essays & Docu */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-xs font-heading font-black tracking-wider uppercase text-accent">
                  GROUP 1 //
                </h3>
                <h4 className="text-sm font-heading font-bold uppercase text-white">
                  Video Essays & Docu
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white/5 text-white/60 border border-white/10">
                Long-Form
              </span>
            </div>

            {/* Toggle: is_coming_soon */}
            <label className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/30 hover:border-accent/40 transition cursor-pointer">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-white/80">
                Coming Soon Placeholder
              </span>
              <input
                type="checkbox"
                checked={dualShowreel.essay.is_coming_soon}
                onChange={(e) => updateDualShowreelCard('essay', 'is_coming_soon', e.target.checked)}
                className="w-4 h-4 rounded accent-accent cursor-pointer"
              />
            </label>

            {/* webm_url */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-heading font-bold tracking-wider uppercase text-white/60 flex items-center justify-between">
                <span>WebM Hover Loop URL</span>
                <span className="text-[9px] text-white/30 font-mono">Supabase Storage / WebM</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://.../essay-loop.webm"
                  value={dualShowreel.essay.webm_url}
                  onChange={(e) => updateDualShowreelCard('essay', 'webm_url', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition"
                />
                <input
                  ref={essayFileInputRef}
                  type="file"
                  accept="video/webm,video/mp4"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('essay', file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingEssay}
                  onClick={() => essayFileInputRef.current?.click()}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-heading font-bold uppercase tracking-wider flex items-center gap-1 transition disabled:opacity-50"
                  title="Upload WebM file to Supabase Storage"
                >
                  <Upload size={12} />
                  {uploadingEssay ? '...' : 'Upload'}
                </button>
              </div>
            </div>

            {/* youtube_url */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-heading font-bold tracking-wider uppercase text-white/60 flex items-center justify-between">
                <span>YouTube Modal Video Link</span>
                <span className="text-[9px] text-white/30 font-mono">Full Modal Embed</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus-within:border-accent/50 transition">
                <Video size={14} className="text-white/40" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={dualShowreel.essay.youtube_url}
                  onChange={(e) => updateDualShowreelCard('essay', 'youtube_url', e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-mono placeholder:text-white/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* GROUP 2: Gaming & Retention */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-xs font-heading font-black tracking-wider uppercase text-accent">
                  GROUP 2 //
                </h3>
                <h4 className="text-sm font-heading font-bold uppercase text-white">
                  Gaming & Retention
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white/5 text-white/60 border border-white/10">
                Pacing & Retention
              </span>
            </div>

            {/* Toggle: is_coming_soon */}
            <label className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/30 hover:border-accent/40 transition cursor-pointer">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-white/80">
                Coming Soon Placeholder
              </span>
              <input
                type="checkbox"
                checked={dualShowreel.gaming.is_coming_soon}
                onChange={(e) => updateDualShowreelCard('gaming', 'is_coming_soon', e.target.checked)}
                className="w-4 h-4 rounded accent-accent cursor-pointer"
              />
            </label>

            {/* webm_url */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-heading font-bold tracking-wider uppercase text-white/60 flex items-center justify-between">
                <span>WebM Hover Loop URL</span>
                <span className="text-[9px] text-white/30 font-mono">Supabase Storage / WebM</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://.../gaming-loop.webm"
                  value={dualShowreel.gaming.webm_url}
                  onChange={(e) => updateDualShowreelCard('gaming', 'webm_url', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition"
                />
                <input
                  ref={gamingFileInputRef}
                  type="file"
                  accept="video/webm,video/mp4"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('gaming', file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingGaming}
                  onClick={() => gamingFileInputRef.current?.click()}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-heading font-bold uppercase tracking-wider flex items-center gap-1 transition disabled:opacity-50"
                  title="Upload WebM file to Supabase Storage"
                >
                  <Upload size={12} />
                  {uploadingGaming ? '...' : 'Upload'}
                </button>
              </div>
            </div>

            {/* youtube_url */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-heading font-bold tracking-wider uppercase text-white/60 flex items-center justify-between">
                <span>YouTube Modal Video Link</span>
                <span className="text-[9px] text-white/30 font-mono">Full Modal Embed</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus-within:border-accent/50 transition">
                <Video size={14} className="text-white/40" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={dualShowreel.gaming.youtube_url}
                  onChange={(e) => updateDualShowreelCard('gaming', 'youtube_url', e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-mono placeholder:text-white/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-heading font-black tracking-widest uppercase hover:brightness-110 transition"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)' }}
          >
            <CheckCircle size={14} />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
