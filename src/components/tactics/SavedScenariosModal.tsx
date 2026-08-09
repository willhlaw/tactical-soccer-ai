import React from 'react';
import { TacticalScenario } from '../../types';
import { X, Folder, Trash2, Calendar, Target, Shield, ArrowRight, Sparkles } from 'lucide-react';

interface SavedScenariosModalProps {
  scenarios: TacticalScenario[];
  onClose: () => void;
  onLoadScenario: (scenario: TacticalScenario) => void;
  onDeleteScenario: (scenarioId: string) => void;
}

export const SavedScenariosModal: React.FC<SavedScenariosModalProps> = ({
  scenarios,
  onClose,
  onLoadScenario,
  onDeleteScenario
}) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                Saved Tactical Scenarios Library
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30 font-bold">
                  {scenarios.length} Saved
                </span>
              </h2>
              <p className="text-xs text-slate-400">Load or manage your saved pitch setups, drills, and set piece plays</p>
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {scenarios.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                <Folder className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Saved Scenarios Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Design player positions, draw vectors, or setup cones on the Tactics Board, then click <strong className="text-emerald-400">"💾 Save Scenario"</strong> to save your setup!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map(sc => (
                <div
                  key={sc.id}
                  className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl space-y-3 transition group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition line-clamp-1">
                        {sc.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-900 text-emerald-400 font-bold rounded-md border border-slate-800 shrink-0">
                        {sc.format}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-medium">
                      {sc.isDrillMode ? (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-bold border border-cyan-500/30">
                          🎯 Drill ({sc.homeCount}v{sc.awayCount}{sc.thirdCount > 0 ? `v${sc.thirdCount}` : ''})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded font-semibold border border-slate-800">
                          🛡️ {sc.formationName}
                        </span>
                      )}

                      {sc.cones?.length > 0 && (
                        <span className="text-amber-400">🔶 {sc.cones.length} Cones</span>
                      )}
                      {sc.arrows?.length > 0 && (
                        <span className="text-emerald-400">↗️ {sc.arrows.length} Vectors</span>
                      )}
                    </div>

                    {sc.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{sc.description}</p>
                    )}

                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(sc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onDeleteScenario(sc.id)}
                      className="p-2 bg-slate-900 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-xl border border-slate-800 transition"
                      title="Delete Scenario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onLoadScenario(sc)}
                      className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                      <span>📂 Load Scenario onto Pitch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
