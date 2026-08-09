import React, { useState } from 'react';
import { generateAIScenario, AIScenarioResult } from '../../services/aiScenarioEngine';
import { FormatType } from '../../types';
import { Sparkles, X, Wand2, Play, Target, Check, Shield } from 'lucide-react';

interface AIScenarioGeneratorModalProps {
  format: FormatType;
  onClose: () => void;
  onApplyScenario: (scenario: AIScenarioResult) => void;
}

const SAMPLE_PROMPTS = [
  "3v2 Fast Break Counter-Attack with 2 Yellow Cone Gates & 2 Balls",
  "4v2 Rondo Possession Box with 4 Corner Cones",
  "4v4+3 Neutral Bumper Game with 3 Gold Neutrals",
  "High Press 4-3-3 vs Build-Out Defense",
  "Wing Overload & Crossing Drill with 3 Attackers",
  "1v1 Duel with Slalom Cone Dribbling & Shot on Goal"
];

export const AIScenarioGeneratorModal: React.FC<AIScenarioGeneratorModalProps> = ({
  format,
  onClose,
  onApplyScenario
}) => {
  const [prompt, setPrompt] = useState<string>('3v2 Counter-Attack drill with 2 passing gates and 2 balls');
  const [generatedResult, setGeneratedResult] = useState<AIScenarioResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const result = generateAIScenario(prompt.trim(), format);
      setGeneratedResult(result);
      setIsGenerating(false);
    }, 400);
  };

  const handleApply = () => {
    if (!generatedResult) {
      const result = generateAIScenario(prompt.trim(), format);
      onApplyScenario(result);
    } else {
      onApplyScenario(generatedResult);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 rounded-2xl shadow-lg shadow-orange-500/20 font-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                AI Scenario Generator
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/30 font-bold">
                  ✨ Instant Generator
                </span>
              </h2>
              <p className="text-xs text-slate-400">Describe any drill or tactical setup and watch AI generate the pitch layout</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Prompt Input Form */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-amber-400" />
              Describe Your Scenario or Drill Prompt:
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g., Create a 3v2 counter-attack with 2 passing gates on flanks, 2 balls, and shot vector arrow..."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setGeneratedResult(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner transition font-medium"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Sample Prompts (Tap to use):</span>
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{isGenerating ? 'Generating Layout...' : '✨ Generate Scenario'}</span>
              </button>
            </div>

            {/* Quick Sample Prompt Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(sample);
                    setGeneratedResult(null);
                  }}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-[11px] font-medium border border-slate-800 transition text-left"
                >
                  ⚡ {sample}
                </button>
              ))}
            </div>
          </form>

          {/* AI Generated Preview Summary */}
          {generatedResult && (
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {generatedResult.title}
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded font-bold border border-amber-500/30">
                  Ready to Apply
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{generatedResult.description}</p>

              {/* Parsed Metrics Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 bg-blue-950/80 text-blue-300 text-[11px] rounded-lg font-bold border border-blue-800/50">
                  🔵 Team A: {generatedResult.homeCount} Players
                </span>
                <span className="px-2.5 py-1 bg-red-950/80 text-red-300 text-[11px] rounded-lg font-bold border border-red-800/50">
                  🔴 Team B: {generatedResult.awayCount} Players
                </span>
                {generatedResult.thirdCount > 0 && (
                  <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 text-[11px] rounded-lg font-bold border border-amber-800/50">
                    🟡 Team C: {generatedResult.thirdCount} Neutrals
                  </span>
                )}
                <span className="px-2.5 py-1 bg-slate-900 text-slate-300 text-[11px] rounded-lg font-bold border border-slate-800">
                  ⚽ Balls: {generatedResult.balls.length}
                </span>
                <span className="px-2.5 py-1 bg-slate-900 text-orange-400 text-[11px] rounded-lg font-bold border border-slate-800">
                  🔶 Cones: {generatedResult.cones.length}
                </span>
                <span className="px-2.5 py-1 bg-slate-900 text-emerald-400 text-[11px] rounded-lg font-bold border border-slate-800">
                  ↗️ Vectors: {generatedResult.arrows.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-900 text-slate-300 font-bold text-xs rounded-xl hover:text-white border border-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Apply AI Scenario to Tactics Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
