import React, { useState, useEffect } from 'react';
import { PitchCanvas } from './PitchCanvas';
import { Team, PitchNode, TacticalArrow, FormationPreset } from '../../types';
import { FORMATION_PRESETS, getFormationsForFormat } from '../../services/formations';
import { Play, Pause, RotateCcw, Trash2, Shield, Zap, Maximize2, Minimize2, PenTool, Users, Star } from 'lucide-react';

interface TacticsBoardProps {
  team: Team;
  onUpdateTeam?: (updatedTeam: Team) => void;
  onUpdateFormation?: (formation: FormationPreset) => void;
}

export const TacticsBoard: React.FC<TacticsBoardProps> = ({ team, onUpdateTeam, onUpdateFormation }) => {
  const availableFormations = getFormationsForFormat(team.format);

  // Load last selected formation or team preferred formation
  const [selectedFormation, setSelectedFormation] = useState<FormationPreset>(() => {
    if (team.preferredFormationId) {
      const preferred = availableFormations.find(f => f.id === team.preferredFormationId);
      if (preferred) return preferred;
    }
    const savedId = localStorage.getItem(`tactical_last_formation_${team.id}_${team.format}`);
    if (savedId) {
      const found = availableFormations.find(f => f.id === savedId);
      if (found) return found;
    }
    return availableFormations[0] || FORMATION_PRESETS[4];
  });

  // Initialize home pitch nodes
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

  // Interactive Soccer Ball state ⚽ (Defaults exact center circle)
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Clean canvas default (no initial lines)
  const [arrows, setArrows] = useState<TacticalArrow[]>([]);

  // Opposition Team nodes state (Red team)
  const [showOpposition, setShowOpposition] = useState<boolean>(false);
  const [awayNodes, setAwayNodes] = useState<PitchNode[]>([
    { id: 'away-1', label: 'A1', role: 'GK', x: 50, y: 10, team: 'away' },
    { id: 'away-2', label: 'A2', role: 'CB', x: 30, y: 28, team: 'away' },
    { id: 'away-3', label: 'A3', role: 'CB', x: 70, y: 28, team: 'away' },
    { id: 'away-4', label: 'A4', role: 'LM', x: 20, y: 48, team: 'away' },
    { id: 'away-5', label: 'A5', role: 'CM', x: 50, y: 50, team: 'away' },
    { id: 'away-6', label: 'A6', role: 'RM', x: 80, y: 48, team: 'away' },
    { id: 'away-7', label: 'A7', role: 'ST', x: 50, y: 75, team: 'away' },
  ]);

  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowType, setArrowType] = useState<'pass' | 'run' | 'dribble' | 'shot'>('pass');
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic reaction when 5v5 / 7v7 / 9v9 / 11v11 format changes in header
  useEffect(() => {
    const available = getFormationsForFormat(team.format);
    let targetFormation = available[0] || FORMATION_PRESETS[4];

    if (team.preferredFormationId) {
      const pref = available.find(f => f.id === team.preferredFormationId);
      if (pref) targetFormation = pref;
    } else {
      const savedId = localStorage.getItem(`tactical_last_formation_${team.id}_${team.format}`);
      if (savedId) {
        const found = available.find(f => f.id === savedId);
        if (found) targetFormation = found;
      }
    }

    setSelectedFormation(targetFormation);
    setNodes(targetFormation.nodes.map((n, i) => ({
      id: 'node-' + i,
      label: n.label,
      role: n.role,
      x: n.x,
      y: n.y,
      assignedPlayerId: team.roster[i]?.id,
      team: 'home'
    })));
    setIsPlayingAnimation(false);
    setBallPos({ x: 50, y: 50 });
  }, [team.format, team.roster, team.id, team.preferredFormationId]);

  const playersMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    team.roster.forEach(p => { map[p.id] = p; });
    return map;
  }, [team.roster]);

  const handleSelectFormation = (f: FormationPreset) => {
    setSelectedFormation(f);
    localStorage.setItem(`tactical_last_formation_${team.id}_${team.format}`, f.id);

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

  const handleSetTeamPreferredFormation = () => {
    if (onUpdateTeam) {
      onUpdateTeam({
        ...team,
        preferredFormationId: selectedFormation.id
      });
    }
  };

  const handleNodeMove = (id: string, newX: number, newY: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
  };

  const handleAwayNodeMove = (id: string, newX: number, newY: number) => {
    setAwayNodes(prev => prev.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
  };

  const handleAddArrow = (arrow: TacticalArrow) => {
    setArrows(prev => [...prev, arrow]);
  };

  const handleResetBoard = () => {
    setIsPlayingAnimation(false);
    setBallPos({ x: 50, y: 50 });
    setArrows([]);
    setNodes(selectedFormation.nodes.map((n, i) => ({
      id: 'node-' + i,
      label: n.label,
      role: n.role,
      x: n.x,
      y: n.y,
      assignedPlayerId: team.roster[i]?.id,
      team: 'home'
    })));
  };

  const handleClearLines = () => {
    setArrows([]);
  };

  const isCurrentPreferred = team.preferredFormationId === selectedFormation.id;

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
              {isCurrentPreferred && (
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30 font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Team Preferred Shape
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">Drag players, opposition, or soccer ball ⚽ to demonstrate plays</p>
          </div>
        </div>

        {/* Formation Dropdown & Lock Preferred Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowOpposition(!showOpposition)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              showOpposition
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{showOpposition ? 'Opposition On' : '+ Opposition'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-300">Formation:</label>
            <select
              value={selectedFormation.id}
              onChange={(e) => {
                const found = availableFormations.find(f => f.id === e.target.value);
                if (found) handleSelectFormation(found);
              }}
              className="bg-slate-900 text-white text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              {availableFormations.map(f => (
                <option key={f.id} value={f.id}>
                  {f.id === team.preferredFormationId ? `⭐ ${f.name}` : f.name}
                </option>
              ))}
            </select>

            {onUpdateTeam && (
              <button
                onClick={handleSetTeamPreferredFormation}
                disabled={isCurrentPreferred}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  isCurrentPreferred
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 cursor-default'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Lock in as Team Official Preferred Formation for all users"
              >
                <Star className={`w-3.5 h-3.5 ${isCurrentPreferred ? 'fill-current text-amber-400' : ''}`} />
                <span>{isCurrentPreferred ? 'Team Preferred' : 'Set as Team Default'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Pitch Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Tactical Board Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Pitch Canvas & Big Touch Bar */}
        <div className="lg:col-span-3 space-y-4">
          <PitchCanvas
            nodes={nodes}
            arrows={arrows}
            playersMap={playersMap}
            onNodeMove={handleNodeMove}
            isDrawingArrow={isDrawingArrow}
            arrowType={arrowType}
            onAddArrow={handleAddArrow}
            isPlayingAnimation={isPlayingAnimation}
            isFullscreen={isFullscreen}
            ballPos={ballPos}
            onBallMove={(x, y) => setBallPos({ x, y })}
            awayNodes={showOpposition ? awayNodes : []}
            onAwayNodeMove={handleAwayNodeMove}
          />

          {/* Fullscreen Overlay Bar when in Maximum Mode */}
          {isFullscreen && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] glass-panel p-4 rounded-3xl flex items-center space-x-4 border-2 border-emerald-400/40 shadow-2xl backdrop-blur-xl">
              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all shadow-xl ${
                  isPlayingAnimation
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/40 animate-pulse'
                    : 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/40 scale-105'
                }`}
              >
                {isPlayingAnimation ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setShowOpposition(!showOpposition)}
                className={`px-4 py-3 rounded-2xl font-bold text-xs border transition ${
                  showOpposition ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                {showOpposition ? 'Opposition On' : '+ Opposition'}
              </button>

              <button
                onClick={handleResetBoard}
                className="w-12 h-12 rounded-full bg-slate-900 text-slate-300 border border-slate-700 flex items-center justify-center"
                title="Reset Board & Ball"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={handleClearLines}
                className="w-12 h-12 rounded-full bg-slate-900 text-slate-300 border border-slate-700 flex items-center justify-center"
                title="Clear Lines"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-2xl flex items-center gap-1.5"
              >
                <Minimize2 className="w-4 h-4" /> Exit Fullscreen
              </button>
            </div>
          )}

          {/* Normal Mode Touch Control Bar */}
          {!isFullscreen && (
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-2 border-emerald-500/20 shadow-xl">
              {/* Draw Mode Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsDrawingArrow(!isDrawingArrow)}
                  className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border ${
                    isDrawingArrow
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  <span>{isDrawingArrow ? 'Drawing Vector Mode' : '+ Draw Vector'}</span>
                </button>

                {isDrawingArrow && (
                  <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                    {(['pass', 'run', 'dribble', 'shot'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setArrowType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                          arrowType === type ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Big Round Animation & Pitch Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all shadow-xl ${
                    isPlayingAnimation
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-500/30 animate-pulse'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/30 scale-105'
                  }`}
                  title={isPlayingAnimation ? "Pause Animation (Holds position)" : "Play Drill Animation"}
                >
                  {isPlayingAnimation ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={handleResetBoard}
                  className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition shadow-md"
                  title="Reset Board & Soccer Ball to Center"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={handleClearLines}
                  className="w-12 h-12 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 flex items-center justify-center transition shadow-md"
                  title="Clear Drawn Tactical Lines"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
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
              {team.playingStyle === 'youth-buildout'
                ? 'Emphasizes split center backs, build-out through the goalkeeper, and aggressive trigger-based high pressing.'
                : 'Balanced positional shape maximizing field coverage and passing options.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Position Assignments:</span>
              <span className="text-[10px] text-amber-400">⚽ Ball Draggable</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {nodes.map(n => {
                const player = n.assignedPlayerId ? playersMap[n.assignedPlayerId] : null;
                return (
                  <div key={n.id} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{n.role} ({n.label}):</span>
                    <span className="text-emerald-400 font-medium">
                      {player ? `#${Number(player.number)} ${player.name}` : 'Unassigned'}
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
