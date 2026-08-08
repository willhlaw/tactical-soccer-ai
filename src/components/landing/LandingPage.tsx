import React, { useState } from 'react';
import { Shield, Sparkles, Check, Play, Smartphone, WifiOff, Users, ArrowRight, Zap } from 'lucide-react';
import { PitchCanvas } from '../tactics/PitchCanvas';
import { DEMO_PLAYERS } from '../../services/storage';
import { PitchNode, TacticalArrow } from '../../types';

interface LandingPageProps {
  onLaunchApp: () => void;
  onSelectProTier: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onSelectProTier }) => {
  // Interactive Pitch Canvas State for Landing Page Hero Widget
  const [nodes, setNodes] = useState<PitchNode[]>([
    { id: 'd1', label: 'GK', role: 'GK', x: 50, y: 88, team: 'home', assignedPlayerId: 'p2' },
    { id: 'd2', label: 'LCB', role: 'LB', x: 30, y: 72, team: 'home', assignedPlayerId: 'p4' },
    { id: 'd3', label: 'RCB', role: 'RB', x: 70, y: 72, team: 'home', assignedPlayerId: 'p9' },
    { id: 'd4', label: 'LM', role: 'LM', x: 20, y: 45, team: 'home', assignedPlayerId: 'p7' },
    { id: 'd5', label: 'CM', role: 'CM', x: 50, y: 48, team: 'home', assignedPlayerId: 'p3' },
    { id: 'd6', label: 'RM', role: 'RM', x: 80, y: 45, team: 'home', assignedPlayerId: 'p5' },
    { id: 'd7', label: 'ST', role: 'ST', x: 50, y: 20, team: 'home', assignedPlayerId: 'p1' },
  ]);

  const [arrows, setArrows] = useState<TacticalArrow[]>([
    { id: 'da1', startX: 50, startY: 88, endX: 70, endY: 72, type: 'pass' },
    { id: 'da2', startX: 70, startY: 72, endX: 50, endY: 48, type: 'run' }
  ]);

  const playersMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    DEMO_PLAYERS.forEach(p => { map[p.id] = p; });
    return map;
  }, []);

  const handleNodeMove = (nodeId: string, newX: number, newY: number) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleAddArrow = (arrow: TacticalArrow) => {
    setArrows(prev => [...prev, arrow]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xl shadow-lg shadow-emerald-500/20">
            TS
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">TacticalSoccer</span>
            <span className="ml-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30">
              AI PWA
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <a href="#pricing" className="text-xs font-semibold text-slate-300 hover:text-white hidden sm:block">Pricing</a>
          <button
            onClick={onLaunchApp}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            Launch Web App <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Built for Rec, Select, Travel &amp; High School Coaches</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Soccer Tactics &amp; Lineups Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Pro Tactical AI</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl">
            The offline-first Progressive Web App for team management. Design interactive 2D pitch boards, run equal-minute fair play sub matrixes, and build tactics with voice AI on the pitch.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onLaunchApp}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition flex items-center gap-2"
            >
              Start Coaching Free <Play className="w-4 h-4 fill-current" />
            </button>
            <a
              href="#pricing"
              className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-800 transition"
            >
              View AI Pro Pricing
            </a>
          </div>

          {/* Feature Badges */}
          <div className="flex items-center space-x-6 pt-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5"><WifiOff className="w-4 h-4 text-emerald-400" /> 100% Offline PWA</div>
            <div className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-blue-400" /> Phone &amp; Tablet</div>
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-400" /> Firebase Sync</div>
          </div>
        </div>

        {/* Live Interactive Canvas Demo Widget */}
        <div className="glass-panel p-4 rounded-3xl space-y-3 border-emerald-500/30 shadow-2xl">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Interactive Pitch (2-3-1 Build-Out Shape)
            </span>
            <span className="text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
              ⚡ Drag players to test!
            </span>
          </div>

          <PitchCanvas
            nodes={nodes}
            arrows={arrows}
            playersMap={playersMap}
            onNodeMove={handleNodeMove}
            onAddArrow={handleAddArrow}
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white">Simple, Honest Pricing</h2>
          <p className="text-sm text-slate-400">Choose the plan that matches your coaching ambition.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">Free Starter</h3>
              <p className="text-xs text-slate-400 mt-1">For single-team volunteer coaches</p>
              <div className="text-3xl font-black text-white mt-4">$0 <span className="text-xs text-slate-400 font-normal">/ forever</span></div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Offline 2D Canvas Pitch Board</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 5v5, 7v7, 9v9, 11v11 Formations</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Basic Roster Management</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> WhatsApp Parent Share Output</li>
            </ul>

            <button
              onClick={onLaunchApp}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              Launch Free App
            </button>
          </div>

          {/* AI Coach Pro Tier */}
          <div className="glass-panel p-8 rounded-3xl space-y-6 border-2 border-emerald-500 relative shadow-2xl shadow-emerald-500/10">
            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow">
              Most Popular
            </div>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                AI Coach Pro <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">For serious coaches &amp; multi-team managers</p>
              <div className="text-3xl font-black text-white mt-4">$9.99 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2 font-semibold text-emerald-300"><Check className="w-4 h-4 text-emerald-400" /> Everything in Free</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Hands-Free AI Voice Assistant</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Youth Build-Out &amp; High Press Style</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Automated Fair Play Equal Minute Matrix</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Firebase Multi-Team Cloud Sync</li>
            </ul>

            <button
              onClick={() => { onSelectProTier(); onLaunchApp(); }}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Start AI Pro 14-Day Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TacticalSoccer AI. Created for @willhlaw.</p>
      </footer>
    </div>
  );
};
