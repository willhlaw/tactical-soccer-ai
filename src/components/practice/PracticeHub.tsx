import React, { useState } from 'react';
import { Drill, Team, DrillKeyframe } from '../../types';
import { DEFAULT_DRILLS } from '../../services/coachingKnowledge';
import { generateAIDrill } from '../../services/aiEngine';
import { PitchCanvas } from '../tactics/PitchCanvas';
import { BookOpen, Share2, Copy, Check, Sparkles, Play, Pause, Edit3, Plus, Bot, ChevronRight, X } from 'lucide-react';

interface PracticeHubProps {
  team: Team;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({ team }) => {
  const [drills, setDrills] = useState<Drill[]>(DEFAULT_DRILLS);
  const [selectedDrill, setSelectedDrill] = useState<Drill>(DEFAULT_DRILLS[0]);
  const [activeKeyframeIndex, setActiveKeyframeIndex] = useState<number>(0);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const currentKeyframe: DrillKeyframe = selectedDrill.keyframes[activeKeyframeIndex] || selectedDrill.keyframes[0];

  const playersMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    team.roster.forEach(p => { map[p.id] = p; });
    return map;
  }, [team.roster]);

  const parentShareText = `⚽ *${team.name} Practice Session & Drills*\n` +
    `📍 *Focus*: ${selectedDrill.title} (${selectedDrill.category})\n` +
    `⏱️ *Duration*: ${selectedDrill.durationMinutes} mins\n\n` +
    `*Coaching Points*:\n` +
    selectedDrill.coachingPoints.map(p => `• ${p}`).join('\n') +
    `\n\n🔗 View Animated Drill: ${window.location.origin}/?drill=${selectedDrill.id}`;

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(parentShareText);
    if (navigator.share) {
      navigator.share({
        title: `${team.name} Practice Session`,
        text: parentShareText,
        url: `${window.location.origin}/?drill=${selectedDrill.id}`
      }).catch(() => {});
    }
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleGenerateAIDrill = (promptText: string) => {
    if (!promptText.trim()) return;
    const newDrill = generateAIDrill(promptText, team.ageGroup);
    setDrills(prev => [newDrill, ...prev]);
    setSelectedDrill(newDrill);
    setActiveKeyframeIndex(0);
    setIsAIGeneratorOpen(false);
    setAiPromptInput('');
  };

  const handleSaveEditedDrill = (updatedDrill: Drill) => {
    setDrills(prev => prev.map(d => d.id === updatedDrill.id ? updatedDrill : d));
    setSelectedDrill(updatedDrill);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-emerald-500">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Practice Hub &amp; Animated Drill Studio
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Browse, AI-generate, or edit 2D animated drill step illustrations for {team.name}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span>+ Generate Drill with AI</span>
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Share with Parents</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Drill Library List */}
        <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Drill Library ({drills.length})
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full border border-emerald-500/30">
              {team.ageGroup}
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {drills.map(drill => (
              <div
                key={drill.id}
                onClick={() => { setSelectedDrill(drill); setActiveKeyframeIndex(0); setIsPlayingAnimation(false); }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedDrill.id === drill.id
                    ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{drill.title}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-emerald-400 font-semibold rounded">
                    {drill.durationMinutes}m
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">{drill.category} • {drill.ageGroup}</div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{drill.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Animated Pitch Visualizer & Step Inspector */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header & Edit Button */}
          <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-bold border border-emerald-500/30">
                  {selectedDrill.category} ({selectedDrill.durationMinutes} Mins)
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">{selectedDrill.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedDrill.description}</p>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="min-h-[40px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Edit Steps</span>
            </button>
          </div>

          {/* Interactive 2D Pitch Canvas Visualizer for Drill Keyframes */}
          <div className="relative space-y-3">
            {currentKeyframe && (
              <PitchCanvas
                nodes={currentKeyframe.nodes}
                arrows={currentKeyframe.arrows}
                playersMap={playersMap}
                isPlayingAnimation={isPlayingAnimation}
              />
            )}

            {/* Step Controls Touch Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-emerald-500/20 shadow-xl">
              {/* Step Switcher Buttons */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300">Animation Step:</span>
                {selectedDrill.keyframes.map((kf, idx) => (
                  <button
                    key={kf.id}
                    onClick={() => { setActiveKeyframeIndex(idx); setIsPlayingAnimation(false); }}
                    className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl text-xs font-black transition active:scale-95 ${
                      idx === activeKeyframeIndex
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Step {kf.stepNumber}
                  </button>
                ))}
              </div>

              {/* Play Drill Animation Button */}
              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className={`min-h-[48px] px-6 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-xl active:scale-95 ${
                  isPlayingAnimation
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 animate-pulse'
                    : 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30'
                }`}
              >
                {isPlayingAnimation ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isPlayingAnimation ? 'Pause Animation' : 'Play Step Animation'}</span>
              </button>
            </div>
          </div>

          {/* Keyframe Step Description & Coaching Points */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-sm">
                Step {currentKeyframe?.stepNumber}: {currentKeyframe?.description}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="font-bold text-amber-400 uppercase tracking-wide">Key Coaching Points:</div>
              <ul className="space-y-1.5 text-slate-300">
                {selectedDrill.coachingPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI Drill Generator Modal */}
      {isAIGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl space-y-4 border border-slate-700 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                AI Tactical Drill Generator
              </h3>
              <button onClick={() => setIsAIGeneratorOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Describe what skill or tactical situation you want to teach, and AI will write the steps and illustrate 2D animated keyframes!
            </p>

            <textarea
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              rows={3}
              placeholder="e.g. U10 Overlapping fullbacks drill with wingers, or 3v2 counter attack drill under pressure..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Quick AI Presets */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 font-semibold">Quick AI Presets:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Overlapping Fullbacks & Wingers',
                  'High Press & Trap Box Rondo',
                  'Rapid Turn & Finish Under Pressure'
                ].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setAiPromptInput(preset)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-800 font-medium transition"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsAIGeneratorOpen(false)}
                className="min-h-[44px] px-5 py-2.5 bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateAIDrill(aiPromptInput || 'Overlapping Fullbacks')}
                className="min-h-[44px] px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20"
              >
                Generate Illustrated Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drill Modal */}
      {isEditModalOpen && (
        <EditDrillModal
          drill={selectedDrill}
          onSave={handleSaveEditedDrill}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

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
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy this formatted summary to share via SMS, Email, or messaging apps with parents:
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-56 overflow-y-auto">
              {parentShareText}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleCopyShareText}
                className="w-full min-h-[44px] py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
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

interface EditDrillModalProps {
  drill: Drill;
  onSave: (d: Drill) => void;
  onClose: () => void;
}

const EditDrillModal: React.FC<EditDrillModalProps> = ({ drill, onSave, onClose }) => {
  const [formData, setFormData] = useState<Drill>({ ...drill });

  const handlePointChange = (idx: number, val: string) => {
    const updated = [...formData.coachingPoints];
    updated[idx] = val;
    setFormData({ ...formData, coachingPoints: updated });
  };

  const handleAddPoint = () => {
    setFormData({ ...formData, coachingPoints: [...formData.coachingPoints, 'New coaching point'] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg p-6 rounded-3xl space-y-4 border border-slate-700 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-black text-white">Edit Drill Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-bold">Drill Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold">Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full mt-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold">Key Coaching Points:</label>
              <button onClick={handleAddPoint} className="text-emerald-400 font-bold text-[11px]">+ Add Point</button>
            </div>
            <div className="space-y-1.5 mt-1.5">
              {formData.coachingPoints.map((pt, i) => (
                <input
                  key={i}
                  type="text"
                  value={pt}
                  onChange={(e) => handlePointChange(i, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="min-h-[44px] px-5 py-2.5 bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold">
            Cancel
          </button>
          <button onClick={() => onSave(formData)} className="min-h-[44px] px-6 py-2.5 bg-emerald-500 text-slate-950 rounded-2xl text-xs font-black">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
