import React, { useState } from 'react';
import { Drill, Team } from '../../types';
import { DEFAULT_DRILLS } from '../../services/coachingKnowledge';
import { BookOpen, Share2, Copy, Check, Sparkles, Play, Users } from 'lucide-react';

interface PracticeHubProps {
  team: Team;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({ team }) => {
  const [selectedDrill, setSelectedDrill] = useState<Drill>(DEFAULT_DRILLS[0]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const parentShareText = `⚽ *${team.name} Practice Session & Drills*\n` +
    `📍 *Focus*: ${selectedDrill.title} (${selectedDrill.category})\n` +
    `⏱️ *Duration*: ${selectedDrill.durationMinutes} mins\n\n` +
    `*Coaching Points*:\n` +
    selectedDrill.coachingPoints.map(p => `• ${p}`).join('\n') +
    `\n\n🔗 View Animated Drill: https://tacticalsoccer.app/share/${selectedDrill.id}`;

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(parentShareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Practice Hub & Parent Drill Sharing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Design age-appropriate training sessions and export visual summaries for parents and assistant coaches.
          </p>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Share2 className="w-4 h-4" />
          Share Drills with Parents
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Drill Library List */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Drill Library ({team.ageGroup})
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {DEFAULT_DRILLS.map(drill => (
              <div
                key={drill.id}
                onClick={() => setSelectedDrill(drill)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedDrill.id === drill.id
                    ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{drill.title}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-emerald-400 font-semibold rounded">
                    {drill.durationMinutes}m
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{drill.category} • {drill.ageGroup}</div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{drill.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Drill Inspector & Keyframes */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg font-bold">
                {selectedDrill.category} ({selectedDrill.durationMinutes} Minutes)
              </span>
              <h3 className="text-lg font-bold text-white mt-2">{selectedDrill.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedDrill.description}</p>
            </div>
          </div>

          {/* Coaching Points */}
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-amber-400 uppercase tracking-wide">Key Coaching Points:</div>
            <ul className="space-y-1 text-slate-300">
              {selectedDrill.coachingPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Keyframe Animation Sequence */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Animation Keyframe Steps:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedDrill.keyframes.map((frame) => (
                <div key={frame.id} className="glass-card p-3 rounded-xl space-y-2 border border-slate-800 text-xs">
                  <div className="font-bold text-emerald-400">Step {frame.stepNumber}:</div>
                  <p className="text-slate-300">{frame.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl space-y-4 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Share Practice Plan with Parents
              </h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy this formatted summary to share via WhatsApp, SMS, or Email with parents:
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-56 overflow-y-auto">
              {parentShareText}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleCopyShareText}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedText ? 'Copied to Clipboard!' : 'Copy Summary & Share Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
