import React, { useState, useEffect } from 'react';
import { PitchCanvas } from './PitchCanvas';
import { Team, PitchNode, TacticalArrow, FormationPreset } from '../../types';
import { FORMATION_PRESETS, getFormationsForFormat } from '../../services/formations';
import { Play, Pause, RotateCcw, Trash2, Shield, Zap, Maximize2, Minimize2, PenTool, Users, Star, Plus, Minus, Target, Grid } from 'lucide-react';

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

  // Drill Mode State (Custom player count on the pitch at a time)
  const [isDrillMode, setIsDrillMode] = useState<boolean>(false);
  const [homeCount, setHomeCount] = useState<number>(3);
  const [awayCount, setAwayCount] = useState<number>(2);

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

  // Helper to generate drill layout based on custom player count
  const generateDrillNodes = (hCount: number, aCount: number) => {
    // Generate Home Nodes
    const newHomeNodes: PitchNode[] = [];
    const baseRoles: PitchNode['role'][] = ['GK', 'ST', 'CM', 'LB', 'RB', 'LW', 'RW', 'CAM', 'CDM', 'CB', 'CB'];
    for (let i = 0; i < hCount; i++) {
      let x = 50;
      let y = 50;
      if (hCount === 1) {
        x = 50; y = 70;
      } else if (hCount === 2) {
        x = i === 0 ? 35 : 65; y = 65;
      } else if (hCount === 3) {
        x = i === 0 ? 50 : (i === 1 ? 30 : 70);
        y = i === 0 ? 75 : 55;
      } else if (hCount === 4) {
        x = i === 0 ? 30 : (i === 1 ? 70 : (i === 2 ? 30 : 70));
        y = i < 2 ? 70 : 45;
      } else {
        // Fallback to selected formation layout or arc
        const presetNode = selectedFormation.nodes[i];
        x = presetNode ? presetNode.x : 20 + (i * 15) % 70;
        y = presetNode ? presetNode.y : 30 + (i * 10) % 50;
      }

      newHomeNodes.push({
        id: 'node-' + i,
        label: `${i + 1}`,
        role: baseRoles[i] || 'CM',
        x,
        y,
        assignedPlayerId: team.roster[i]?.id,
        team: 'home'
      });
    }

    // Generate Away Nodes
    const newAwayNodes: PitchNode[] = [];
    for (let j = 0; j < aCount; j++) {
      let x = 50;
      let y = 35;
      if (aCount === 1) {
        x = 50; y = 35;
      } else if (aCount === 2) {
        x = j === 0 ? 38 : 62; y = 40;
      } else if (aCount === 3) {
        x = j === 0 ? 50 : (j === 1 ? 30 : 70);
        y = j === 0 ? 25 : 42;
      } else {
        x = 25 + (j * 20) % 65;
        y = 25 + (j * 12) % 45;
      }

      newAwayNodes.push({
        id: 'away-' + (j + 1),
        label: `A${j + 1}`,
        role: j === 0 ? 'CB' : 'CM',
        x,
        y,
        team: 'away'
      });
    }

    setNodes(newHomeNodes);
    setAwayNodes(newAwayNodes);
    if (aCount > 0) setShowOpposition(true);
  };

  // Dynamic reaction when 5v5 / 7v7 / 9v9 / 11v11 format changes in header
  useEffect(() => {
    if (isDrillMode) return; // Keep drill count if in drill mode

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
  }, [team.format, team.roster, team.id, team.preferredFormationId, isDrillMode]);

  const playersMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    team.roster.forEach(p => { map[p.id] = p; });
    return map;
  }, [team.roster]);

  const handleSelectFormation = (f: FormationPreset) => {
    setIsDrillMode(false);
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

  const handleApplyDrillPreset = (hCount: number, aCount: number) => {
    setIsDrillMode(true);
    setHomeCount(hCount);
    setAwayCount(aCount);
    generateDrillNodes(hCount, aCount);
  };

  const handleUpdateHomeCount = (delta: number) => {
    const next = Math.max(1, Math.min(11, homeCount + delta));
    setHomeCount(next);
    setIsDrillMode(true);
    generateDrillNodes(next, awayCount);
  };

  const handleUpdateAwayCount = (delta: number) => {
    const next = Math.max(0, Math.min(11, awayCount + delta));
    setAwayCount(next);
    setIsDrillMode(true);
    generateDrillNodes(homeCount, next);
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
    if (isDrillMode) {
      generateDrillNodes(homeCount, awayCount);
    } else {
      setNodes(selectedFormation.nodes.map((n, i) => ({
        id: 'node-' + i,
        label: n.label,
        role: n.role,
        x: n.x,
        y: n.y,
        assignedPlayerId: team.roster[i]?.id,
        team: 'home'
      })));
    }
  };

  const handleClearLines = () => {
    setArrows([]);
  };

  const isCurrentPreferred = team.preferredFormationId === selectedFormation.id;

  // 100% OPAQUE FULL-SCREEN VIEWPORT MODAL OVERLAY
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 w-screen h-screen p-4 flex flex-col justify-between select-none touch-none overflow-hidden">
        {/* Fullscreen Header Bar */}
        <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">
              TS
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                {team.name} Fullscreen Board ({team.format})
                {isDrillMode ? (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full border border-cyan-500/30 font-bold">
                    🎯 Drill Mode ({homeCount}v{awayCount})
                  </span>
                ) : isCurrentPreferred && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/30 font-medium">
                    ⭐ Preferred Shape
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowOpposition(!showOpposition)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                showOpposition
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{showOpposition ? 'Opposition On' : '+ Opposition'}</span>
            </button>

            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Minimize2 className="w-4 h-4" /> Exit Fullscreen
            </button>
          </div>
        </div>

        {/* 100% Full Height Pitch Canvas */}
        <div className="flex-1 my-3 relative w-full h-full overflow-hidden">
          <PitchCanvas
            nodes={nodes}
            arrows={arrows}
            playersMap={playersMap}
            onNodeMove={handleNodeMove}
            isDrawingArrow={isDrawingArrow}
            arrowType={arrowType}
            onAddArrow={handleAddArrow}
            isPlayingAnimation={isPlayingAnimation}
            isFullscreen={true}
            ballPos={ballPos}
            onBallMove={(x, y) => setBallPos({ x, y })}
            awayNodes={showOpposition ? awayNodes : []}
            onAwayNodeMove={handleAwayNodeMove}
          />
        </div>

        {/* Floating Bottom Touch Bar */}
        <div className="bg-slate-900/95 backdrop-blur p-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-2xl">
          {/* Vector Drawing Mode Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDrawingArrow(!isDrawingArrow)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
                isDrawingArrow
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>{isDrawingArrow ? 'Drawing Vector Mode' : '+ Draw Vector'}</span>
            </button>

            {isDrawingArrow && (
              <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['pass', 'run', 'dribble', 'shot'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setArrowType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      arrowType === type ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Touch Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-xl ${
                isPlayingAnimation
                  ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/40 animate-pulse'
                  : 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/40 scale-105'
              }`}
            >
              {isPlayingAnimation ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleResetBoard}
              className="w-11 h-11 rounded-full bg-slate-950 text-slate-300 border border-slate-800 flex items-center justify-center"
              title="Reset Board & Ball"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleClearLines}
              className="w-11 h-11 rounded-full bg-slate-950 text-slate-300 border border-slate-800 flex items-center justify-center"
              title="Clear Lines"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal In-Page Mode
  return (
    <div className="space-y-6">
      {/* Mode Switcher Banner: Match Formation vs Custom Player Drill Mode */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Tactics Board ({team.format})
              {isDrillMode && (
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30 font-bold flex items-center gap-1">
                  <Target className="w-3 h-3" /> Drill Mode ({homeCount}v{awayCount})
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {isDrillMode
                ? `Drill Mode active: Pick exact player count on the pitch at a time (${homeCount} Home vs ${awayCount} Away)`
                : 'Drag players, opposition, or soccer ball ⚽ to demonstrate plays'}
            </p>
          </div>
        </div>

        {/* Mode Toggle & Presets */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsDrillMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                !isDrillMode ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Full Formation</span>
            </button>
            <button
              onClick={() => {
                setIsDrillMode(true);
                generateDrillNodes(homeCount, awayCount);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isDrillMode ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Drill Mode</span>
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
            title="Fullscreen Pitch Mode"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drill Mode Player Counter Toolbar */}
      {isDrillMode ? (
        <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-2 border-cyan-500/30 bg-cyan-950/20">
          <div className="flex items-center space-x-6">
            {/* Home Player Count Control */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-blue-300">Home Players:</span>
              <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleUpdateHomeCount(-1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-sm text-blue-400">{homeCount}</span>
                <button
                  onClick={() => handleUpdateHomeCount(1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Away Opposition Count Control */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-red-300">Away Defenders:</span>
              <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleUpdateAwayCount(-1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-sm text-red-400">{awayCount}</span>
                <button
                  onClick={() => handleUpdateAwayCount(1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Drill Presets */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Presets:</span>
            {[
              { label: '1v1', h: 1, a: 1 },
              { label: '2v1 Overload', h: 2, a: 1 },
              { label: '3v2 Counter', h: 3, a: 2 },
              { label: '4v2 Rondo', h: 4, a: 2 },
              { label: '4v4 Small Game', h: 4, a: 4 },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => handleApplyDrillPreset(preset.h, preset.a)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  homeCount === preset.h && awayCount === preset.a
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Standard Formation Toolbar */
        <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowOpposition(!showOpposition)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
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
          </div>
        </div>
      )}

      {/* Main Tactical Board Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Pitch Canvas & Touch Control Bar */}
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
            isFullscreen={false}
            ballPos={ballPos}
            onBallMove={(x, y) => setBallPos({ x, y })}
            awayNodes={showOpposition ? awayNodes : []}
            onAwayNodeMove={handleAwayNodeMove}
          />

          {/* Normal Mode Touch Control Bar */}
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all shadow-xl ${
                  isPlayingAnimation
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-500/30 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/30 scale-105'
                }`}
                title={isPlayingAnimation ? "Pause Animation" : "Play Drill Animation"}
              >
                {isPlayingAnimation ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleResetBoard}
                className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition shadow-md"
                title="Reset Board & Ball to Center"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={handleClearLines}
                className="w-12 h-12 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 flex items-center justify-center transition shadow-md"
                title="Clear Drawn Lines"
              >
                <Trash2 className="w-5 h-5" />
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
            <div className="font-semibold text-emerald-300">
              {isDrillMode ? `Drill Setup: ${homeCount}v${awayCount}` : `Active Formation: ${selectedFormation.name}`}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isDrillMode
                ? `Focuses on small-sided ${homeCount}v${awayCount} overload dynamics, quick passing under pressure, and spatial awareness.`
                : team.playingStyle === 'youth-buildout'
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
                    <span className="text-blue-400 font-medium">
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
