import React, { useState, useEffect } from 'react';
import { Drill, Team, DrillKeyframe } from '../../types';
import { DEFAULT_DRILLS } from '../../services/coachingKnowledge';
import { generateAIDrill } from '../../services/aiEngine';
import { getLocalCustomDrills, saveLocalCustomDrill, deleteLocalCustomDrill } from '../../services/storage';
import { PitchCanvas } from '../tactics/PitchCanvas';
import { CustomDrillModal } from './CustomDrillModal';
import { BookOpen, Share2, Copy, Check, Sparkles, Play, Pause, Plus, Bot, ChevronRight, X, PenTool, Trash2 } from 'lucide-react';

interface PracticeHubProps {
  team: Team;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({ team }) => {
  // Combine DEFAULT_DRILLS with local custom saved drills
  const [drills, setDrills] = useState<Drill[]>(() => {
    const customDrills = getLocalCustomDrills();
    return [...customDrills, ...DEFAULT_DRILLS];
  });

  const [selectedDrill, setSelectedDrill] = useState<Drill>(() => drills[0] || DEFAULT_DRILLS[0]);
  const [activeKeyframeIndex, setActiveKeyframeIndex] = useState<number>(0);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState<boolean>(false);
  const [isCustomDrillModalOpen, setIsCustomDrillModalOpen] = useState<boolean>(false);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
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
    saveLocalCustomDrill(newDrill);
    setDrills(prev => [newDrill, ...prev]);
    setSelectedDrill(newDrill);
    setActiveKeyframeIndex(0);
    setIsAIGeneratorOpen(false);
    setAiPromptInput('');
  };

  const handleSaveCustomDrill = (newDrill: Drill) => {
    saveLocalCustomDrill(newDrill);
    setDrills(prev => {
      const idx = prev.findIndex(d => d.id === newDrill.id);
      if (idx >= 0) {
        return prev.map((d, i) => i === idx ? newDrill : d);
      }
      return [newDrill, ...prev];
    });
    setSelectedDrill(newDrill);
    setActiveKeyframeIndex(0);
    setIsCustomDrillModalOpen(false);
    setEditingDrill(null);
  };

  const handleDeleteCustomDrill = (drillId: string) => {
    deleteLocalCustomDrill(drillId);
    setDrills(prev => {
      const filtered = prev.filter(d => d.id !== drillId);
      if (selectedDrill.id === drillId) {
        setSelectedDrill(filtered[0] || DEFAULT_DRILLS[0]);
      }
      return filtered;
    });
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
            Create custom drills, AI-generate tactics, or browse 2D animated illustrations for {team.name}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => { setEditingDrill(null); setIsCustomDrillModalOpen(true); }}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <PenTool className="w-4 h-4" />
            <span>➕ Make Your Own Drill</span>
          </button>
          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AI Drill Generator</span>
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
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    {drill.title}
                    {drill.isCustom && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded border border-amber-500/30">
                        Custom
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-emerald-400 font-semibold rounded shrink-0">
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
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
                  {selectedDrill.category}
                </span>
                <span className="text-xs text-slate-400">⏱️ {selectedDrill.durationMinutes} Mins</span>
                {selectedDrill.isCustom && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-500/30">
                    Custom Coach Drill
                  </span>
                )}
              </div>
              <h3 className="text-lg md:text-xl font-black text-white mt-1">{selectedDrill.title}</h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setEditingDrill(selectedDrill); setIsCustomDrillModalOpen(true); }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
              >
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Drill</span>
              </button>

              {selectedDrill.isCustom && (
                <button
                  onClick={() => handleDeleteCustomDrill(selectedDrill.id)}
                  className="px-3 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1"
                  title="Delete Custom Drill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-lg ${
                  isPlayingAnimation
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 animate-pulse'
                    : 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30'
                }`}
              >
                {isPlayingAnimation ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlayingAnimation ? 'Pause' : 'Play 60fps Animation'}</span>
              </button>
            </div>
          </div>

          {/* 2D Pitch Canvas Animation Viewer */}
          <div className="glass-panel p-4 rounded-2xl space-y-4 border border-slate-800">
            <div className="h-80 md:h-96 w-full relative overflow-hidden rounded-2xl border-2 border-emerald-950">
              <PitchCanvas
                nodes={currentKeyframe.nodes}
                arrows={currentKeyframe.arrows}
                playersMap={playersMap}
                isPlayingAnimation={isPlayingAnimation}
                isFullscreen={false}
              />
            </div>

            {/* Step Navigation Tabs */}
            <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2 overflow-x-auto">
                {selectedDrill.keyframes.map((kf, idx) => (
                  <button
                    key={kf.id}
                    onClick={() => { setActiveKeyframeIndex(idx); setIsPlayingAnimation(false); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      activeKeyframeIndex === idx
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Step {kf.stepNumber}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 font-semibold shrink-0">
                Step {activeKeyframeIndex + 1} of {selectedDrill.keyframes.length}
              </div>
            </div>

            {/* Step Description */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-white">Instruction: </strong>
              {currentKeyframe.description}
            </div>
          </div>

          {/* Coaching Points */}
          <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Key Coaching Points
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedDrill.coachingPoints.map((point, i) => (
                <div key={i} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM DRILL CREATOR / EDIT MODAL */}
      {isCustomDrillModalOpen && (
        <CustomDrillModal
          team={team}
          initialDrill={editingDrill}
          onClose={() => { setIsCustomDrillModalOpen(false); setEditingDrill(null); }}
          onSave={handleSaveCustomDrill}
        />
      )}

      {/* SHARE WITH PARENTS MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" /> Share Drill &amp; Session Plan
              </h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {parentShareText}
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCopyShareText}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'Copied to Clipboard!' : 'Copy / Web Share Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI DRILL GENERATOR MODAL */}
      {isAIGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" /> AI Tactical Drill Studio
              </h3>
              <button onClick={() => setIsAIGeneratorOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Describe your coaching goal, opponent tactic, or skill focus, and AI will construct custom step illustrations with keyframes:
            </p>

            <textarea
              rows={3}
              placeholder="e.g., 3v2 counter-attacking drill focusing on rapid transition and overlapping fullbacks for U10..."
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsAIGeneratorOpen(false)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateAIDrill(aiPromptInput)}
                className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" /> Generate 2D Drill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
