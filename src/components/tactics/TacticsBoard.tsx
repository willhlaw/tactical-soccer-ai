import React, { useState } from 'react';
import { PitchCanvas } from './PitchCanvas';
import { Team, PitchNode, TacticalArrow, FormationPreset } from '../../types';
import { FORMATION_PRESETS, getFormationsForFormat } from '../../services/formations';
import { Play, Pause, RotateCcw, Plus, Trash2, ArrowUpRight, Shield, Zap, Sparkles } from 'lucide-react';

interface TacticsBoardProps {
  team: Team;
  onUpdateFormation?: (formation: FormationPreset) => void;
}

export const TacticsBoard: React.FC<TacticsBoardProps> = ({ team, onUpdateFormation }) => {
  const availableFormations = getFormationsForFormat(team.format);
  const [selectedFormation, setSelectedFormation] = useState<FormationPreset>(
    availableFormations[0] || FORMATION_PRESETS[2]
  );

  // Initialize pitch nodes from selected formation
  const [nodes, setNodes] = useState<PitchNode[]>(() => {
    return selectedFormation.nodes.map((n, i) => ({
      id: 'node-' + i,
      label: n.label,
      role: n.role,
      x: n.x,
      y: n.y,
      assignedPlayerId: team.roster[i]?.id,
      team: 'home'
    }));
  });

  const [arrows, setArrows] = useState<TacticalArrow[]>([
    { id: 'a1', startX: 50, startY: 88, endX: 75, endY: 72, type: 'pass' },
    { id: 'a2', startX: 75, startY: 72, endX: 50, endY: 48, type: 'run' }
  ]);

  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowType, setArrowType] = useState<'pass' | 'run' | 'dribble' | 'shot'>('pass');
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

  const playersMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    team.roster.forEach(p => { map[p.id] = p; });
    return map;
  }, [team.roster]);

  const handleSelectFormation = (f: FormationPreset) => {
    setSelectedFormation(f);
    setNodes(f.nodes.map((n, i) => ({
      id: 'node-' + i,
      label: n.label,
      role: n.role,
      x: n.x,
      y: n.y,
      assignedPlayerId: team.roster[i]?.id,
      team: 'home'
    })));
    if (onUpdateFormation) onUpdateFormation(f);
  };

  const handleNodeMove = (id: string, newX: number, newY: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
  };

  const handleAddArrow = (arrow: TacticalArrow) => {
    setArrows(prev => [...prev, arrow]);
  };

  const handleClearArrows = () => {
    setArrows([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Controls & Formation Selector */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Tactics Board ({team.format})
              {team.playingStyle === 'coach-rory' && (
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30 font-medium">
                  Coach Rory Style
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">Drag players or draw tactical pass/run vectors</p>
          </div>
        </div>

        {/* Formation Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-300">Formation:</label>
          <select
            value={selectedFormation.id}
            onChange={(e) => {
              const found = availableFormations.find(f => f.id === e.target.value);
              if (found) handleSelectFormation(found);
            }}
            className="bg-slate-900 text-white text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {availableFormations.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tactical Board Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Pitch Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <PitchCanvas
            nodes={nodes}
            arrows={arrows}
            playersMap={playersMap}
            onNodeMove={handleNodeMove}
            isDrawingArrow={isDrawingArrow}
            arrowType={arrowType}
            onAddArrow={handleAddArrow}
          />

          {/* Canvas Toolbar */}
          <div className="glass-panel p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Arrow Draw Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Draw Vector:</span>
              <button
                onClick={() => setIsDrawingArrow(!isDrawingArrow)}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  isDrawingArrow ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isDrawingArrow ? 'Drawing Active' : '+ Draw Line'}
              </button>

              {isDrawingArrow && (
                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(['pass', 'run', 'dribble', 'shot'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setArrowType(type)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold capitalize ${
                        arrowType === type ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Animation & Action Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition"
              >
                {isPlayingAnimation ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAnimation ? 'Pause Playback' : 'Play Drill'}</span>
              </button>
              <button
                onClick={handleClearArrows}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Lines</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Tactical Sidebar */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Tactical Analysis
          </h3>

          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-xs space-y-2">
            <div className="font-semibold text-emerald-300">Active Formation: {selectedFormation.name}</div>
            <p className="text-slate-300 leading-relaxed">
              {team.playingStyle === 'coach-rory'
                ? 'Emphasizes split center backs, build-out through the goalkeeper, and aggressive trigger-based high pressing.'
                : 'Balanced positional shape maximizing field coverage and passing options.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">Position Assignments:</div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {nodes.map(n => {
                const player = n.assignedPlayerId ? playersMap[n.assignedPlayerId] : null;
                return (
                  <div key={n.id} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{n.role} ({n.label}):</span>
                    <span className="text-emerald-400 font-medium">
                      {player ? `#${player.number} ${player.name}` : 'Unassigned'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
