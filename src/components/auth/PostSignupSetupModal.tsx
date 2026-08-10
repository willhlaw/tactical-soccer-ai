import React from 'react';
import { Sparkles, Trash2, CheckCircle2, Shield, ArrowRight } from 'lucide-react';

interface PostSignupSetupModalProps {
  teamName: string;
  playerCount: number;
  onKeepData: () => void;
  onStartFresh: () => void;
}

export const PostSignupSetupModal: React.FC<PostSignupSetupModalProps> = ({
  teamName,
  playerCount,
  onKeepData,
  onStartFresh
}) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-white">Welcome to TacticalSoccer AI!</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            How would you like to set up your team workspace?
          </p>
        </div>

        {/* Choice Cards */}
        <div className="p-6 space-y-4">
          {/* Choice A: Keep & Sync Demo Work */}
          <div
            onClick={onKeepData}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border-2 border-emerald-500/50 hover:border-emerald-400 cursor-pointer transition-all space-y-2 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Keep &amp; Sync My Work (Recommended)</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30 font-bold">
                Preserve Edits
              </span>
            </div>
            <p className="text-xs text-slate-300 pl-7 leading-relaxed">
              Keep your existing team <span className="font-bold text-white">"{teamName}"</span> ({playerCount} players), saved tactical scenarios, and custom drills created during your demo session.
            </p>
          </div>

          {/* Choice B: Start Fresh with Clean Team */}
          <div
            onClick={onStartFresh}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Start Fresh (Clear Demo Data)</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded-full font-bold">
                Clean Slate
              </span>
            </div>
            <p className="text-xs text-slate-400 pl-7 leading-relaxed">
              Wipe sample demo players and start fresh with a clean, empty team for your club or school.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
