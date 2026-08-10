import React, { useState, useEffect } from 'react';
import { PitchCanvas } from './PitchCanvas';
import { Team, PitchNode, TacticalArrow, TacticalCone, FormationPreset, TacticalScenario, TacticalKeyframe } from '../../types';
import { FORMATION_PRESETS, getFormationsForFormat } from '../../services/formations';
import { getLocalScenarios, saveLocalScenario, deleteLocalScenario, getTacticsBoardFullscreenDefault, setTacticsBoardFullscreenDefault } from '../../services/storage';
import { SavedScenariosModal } from './SavedScenariosModal';
import { AIScenarioGeneratorModal } from './AIScenarioGeneratorModal';
import { AIScenarioResult } from '../../services/aiScenarioEngine';
import { Play, Pause, RotateCcw, Trash2, Shield, Zap, Maximize2, Minimize2, PenTool, Users, Star, Plus, Minus, Target, Grid, Save, Folder, Check, X, Sparkles, Monitor, Film, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [thirdCount, setThirdCount] = useState<number>(0);

  // Soccer Balls State ⚽ (Multi-ball selector)
  const [balls, setBalls] = useState<Array<{ id: string; x: number; y: number }>>([
    { id: 'ball-1', x: 50, y: 50 }
  ]);

  // Tactical Cones State 🔶
  const [cones, setCones] = useState<TacticalCone[]>([]);
  const [isPlacingCone, setIsPlacingCone] = useState<boolean>(false);
  const [coneColor, setConeColor] = useState<'orange' | 'yellow' | 'blue' | 'red'>('orange');

  // Keyframe Sequence Timeline State 🎬
  const [keyframes, setKeyframes] = useState<TacticalKeyframe[]>([]);
  const [activeKeyframeIndex, setActiveKeyframeIndex] = useState<number>(0);
  const [timelineProgress, setTimelineProgress] = useState<number>(0);

  // Saved Scenarios State 📁 & AI Generator State ✨
  const [scenarios, setScenarios] = useState<TacticalScenario[]>(() => getLocalScenarios());
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isScenariosLibraryOpen, setIsScenariosLibraryOpen] = useState<boolean>(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState<boolean>(false);
  const [scenarioTitleInput, setScenarioTitleInput] = useState<string>('');
  const [scenarioDescInput, setScenarioDescInput] = useState<string>('');
  const [savedSuccessBanner, setSavedSuccessBanner] = useState<boolean>(false);

  // Default Fullscreen Setting State 🖥️
  const [alwaysFullscreen, setAlwaysFullscreen] = useState<boolean>(() => getTacticsBoardFullscreenDefault());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => getTacticsBoardFullscreenDefault());

  // Bulletproof Exit Fullscreen Function (Guarantees user can always exit)
  const handleExitFullscreen = () => {
    setIsFullscreen(false);
    setAlwaysFullscreen(false);
    setTacticsBoardFullscreenDefault(false);
  };

  // Keyboard Escape Key Listener for Exit Fullscreen ⌨️
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        handleExitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Clean canvas default (no initial lines)
  const [arrows, setArrows] = useState<TacticalArrow[]>([]);

  // Opposition Team B nodes state (Red team)
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

  // 3rd Team C nodes state (Gold/Amber Neutrals / 3rd Team)
  const [thirdNodes, setThirdNodes] = useState<PitchNode[]>([]);

  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowType, setArrowType] = useState<'pass' | 'run' | 'dribble' | 'shot'>('pass');
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

  // Fullscreen Preference Setting Handler 🖥️
  const handleToggleAlwaysFullscreen = () => {
    const next = !alwaysFullscreen;
    setAlwaysFullscreen(next);
    setTacticsBoardFullscreenDefault(next);
    if (next) {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  };

  // Multi-Ball Handlers ⚽
  const handleUpdateBallCount = (delta: number) => {
    setBalls(prev => {
      const currentCount = prev.length;
      const targetCount = Math.max(1, Math.min(10, currentCount + delta));
      if (targetCount === currentCount) return prev;

      if (targetCount > currentCount) {
        const newBalls = [...prev];
        for (let i = currentCount; i < targetCount; i++) {
          const offsetX = 50 + (i % 2 === 0 ? (i * 6) : -(i * 6));
          const offsetY = 50 + Math.floor(i / 2) * 8;
          newBalls.push({
            id: 'ball-' + (i + 1),
            x: Math.max(10, Math.min(90, offsetX)),
            y: Math.max(10, Math.min(90, offsetY))
          });
        }
        return newBalls;
      } else {
        return prev.slice(0, targetCount);
      }
    });
  };

  const handleMultiBallMove = (ballId: string, newX: number, newY: number) => {
    setBalls(prev => prev.map(b => b.id === ballId ? { ...b, x: newX, y: newY } : b));
  };

  // Keyframe Sequence Timeline Handlers 🎬
  const handleAddKeyframe = () => {
    const nextTimestamp = (keyframes.length + 1) * 2.0;
    const newFrame: TacticalKeyframe = {
      id: 'kf-' + Date.now(),
      timestamp: nextTimestamp,
      label: `Step ${keyframes.length + 1} (${nextTimestamp.toFixed(1)}s)`,
      nodes: JSON.parse(JSON.stringify(nodes)),
      awayNodes: JSON.parse(JSON.stringify(awayNodes)),
      thirdNodes: JSON.parse(JSON.stringify(thirdNodes)),
      balls: JSON.parse(JSON.stringify(balls)),
      arrows: JSON.parse(JSON.stringify(arrows)),
      cones: JSON.parse(JSON.stringify(cones))
    };

    setKeyframes(prev => [...prev, newFrame]);
    setActiveKeyframeIndex(keyframes.length);
  };

  const handleSelectKeyframe = (index: number) => {
    if (index < 0 || index >= keyframes.length) return;
    setActiveKeyframeIndex(index);
    const kf = keyframes[index];
    if (kf) {
      setNodes(kf.nodes);
      setAwayNodes(kf.awayNodes);
      setThirdNodes(kf.thirdNodes);
      setBalls(kf.balls);
      setArrows(kf.arrows);
      setCones(kf.cones);
    }
  };

  // AI Scenario Generator Handler ✨
  const handleApplyAIScenario = (aiSc: AIScenarioResult) => {
    setIsDrillMode(aiSc.isDrillMode);
    setHomeCount(aiSc.homeCount);
    setAwayCount(aiSc.awayCount);
    setThirdCount(aiSc.thirdCount);
    setNodes(aiSc.nodes);
    setAwayNodes(aiSc.awayNodes);
    setThirdNodes(aiSc.thirdNodes);
    setArrows(aiSc.arrows);
    setCones(aiSc.cones);
    setBalls(aiSc.balls);
    if (aiSc.awayCount > 0 || aiSc.thirdCount > 0) setShowOpposition(true);
    setIsAIGeneratorOpen(false);
  };

  // Helper to generate drill layout based on custom 3-team player counts
  const generateDrillNodes = (hCount: number, aCount: number, tCount: number) => {
    const newHomeNodes: PitchNode[] = [];
    const baseRoles: PitchNode['role'][] = ['GK', 'ST', 'CM', 'LB', 'RB', 'LW', 'RW', 'CAM', 'CDM', 'CB', 'CB'];
    for (let i = 0; i < hCount; i++) {
      let x = 50; let y = 50;
      if (hCount === 1) { x = 50; y = 70; }
      else if (hCount === 2) { x = i === 0 ? 35 : 65; y = 65; }
      else if (hCount === 3) { x = i === 0 ? 50 : (i === 1 ? 30 : 70); y = i === 0 ? 75 : 55; }
      else if (hCount === 4) { x = i === 0 ? 30 : (i === 1 ? 70 : (i === 2 ? 30 : 70)); y = i < 2 ? 70 : 45; }
      else {
        const presetNode = selectedFormation.nodes[i];
        x = presetNode ? presetNode.x : 20 + (i * 15) % 70;
        y = presetNode ? presetNode.y : 30 + (i * 10) % 50;
      }

      newHomeNodes.push({
        id: 'node-' + i,
        label: `${i + 1}`,
        role: baseRoles[i] || 'CM',
        x, y,
        assignedPlayerId: team.roster[i]?.id,
        team: 'home'
      });
    }

    const newAwayNodes: PitchNode[] = [];
    for (let j = 0; j < aCount; j++) {
      let x = 50; let y = 35;
      if (aCount === 1) { x = 50; y = 35; }
      else if (aCount === 2) { x = j === 0 ? 38 : 62; y = 40; }
      else if (aCount === 3) { x = j === 0 ? 50 : (j === 1 ? 35 : 65); y = j === 0 ? 25 : 42; }
      else { x = 25 + (j * 20) % 65; y = 25 + (j * 14) % 45; }

      newAwayNodes.push({
        id: 'away-' + (j + 1),
        label: `B${j + 1}`,
        role: j === 0 ? 'CB' : 'CM',
        x, y,
        team: 'away'
      });
    }

    const newThirdNodes: PitchNode[] = [];
    for (let k = 0; k < tCount; k++) {
      let x = 50; let y = 50;
      if (tCount === 1) { x = 50; y = 50; }
      else if (tCount === 2) { x = 50; y = k === 0 ? 30 : 70; }
      else if (tCount === 3) { x = k === 0 ? 15 : (k === 1 ? 85 : 50); y = 50; }
      else { x = 15 + (k * 22) % 75; y = 20 + (k * 18) % 60; }

      newThirdNodes.push({
        id: 'third-' + (k + 1),
        label: `C${k + 1}`,
        role: 'CM',
        x, y,
        team: 'third'
      });
    }

    setNodes(newHomeNodes);
    setAwayNodes(newAwayNodes);
    setThirdNodes(newThirdNodes);
    if (aCount > 0 || tCount > 0) setShowOpposition(true);
  };

  // Cone Handlers 🔶
  const handleAddCone = (cone: TacticalCone) => {
    setCones(prev => [...prev, cone]);
  };

  const handleConeMove = (coneId: string, newX: number, newY: number) => {
    setCones(prev => prev.map(c => c.id === coneId ? { ...c, x: newX, y: newY } : c));
  };

  const handleDeleteCone = (coneId: string) => {
    setCones(prev => prev.filter(c => c.id !== coneId));
  };

  const handleApplyBoxGrid = () => {
    setCones([
      { id: 'c-top-left', x: 25, y: 25, color: coneColor },
      { id: 'c-top-right', x: 75, y: 25, color: coneColor },
      { id: 'c-bottom-left', x: 25, y: 75, color: coneColor },
      { id: 'c-bottom-right', x: 75, y: 75, color: coneColor },
    ]);
  };

  const handleApplyGatesGrid = () => {
    setCones([
      { id: 'g1-left', x: 20, y: 35, color: 'yellow' },
      { id: 'g1-right', x: 20, y: 45, color: 'yellow' },
      { id: 'g2-left', x: 80, y: 35, color: 'yellow' },
      { id: 'g2-right', x: 80, y: 45, color: 'yellow' },
    ]);
  };

  const handleClearCones = () => {
    setCones([]);
  };

  // Scenario Handlers 📁
  const handleOpenSaveModal = () => {
    const defaultTitle = isDrillMode
      ? `${homeCount}v${awayCount}${thirdCount > 0 ? `v${thirdCount}` : ''} Drill Setup (${balls.length} Balls)`
      : `${selectedFormation.name} Setup`;
    setScenarioTitleInput(defaultTitle);
    setScenarioDescInput('');
    setIsSaveModalOpen(true);
  };

  const handleConfirmSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioTitleInput.trim()) return;

    const newScenario: TacticalScenario = {
      id: 'scenario-' + Date.now(),
      title: scenarioTitleInput.trim(),
      description: scenarioDescInput.trim(),
      createdAt: new Date().toISOString(),
      format: team.format,
      formationName: selectedFormation.name,
      isDrillMode,
      homeCount,
      awayCount,
      thirdCount,
      nodes: JSON.parse(JSON.stringify(nodes)),
      awayNodes: JSON.parse(JSON.stringify(awayNodes)),
      thirdNodes: JSON.parse(JSON.stringify(thirdNodes)),
      arrows: JSON.parse(JSON.stringify(arrows)),
      cones: JSON.parse(JSON.stringify(cones)),
      ballPos: balls[0] ? { x: balls[0].x, y: balls[0].y } : { x: 50, y: 50 },
      balls: JSON.parse(JSON.stringify(balls)),
      keyframes: JSON.parse(JSON.stringify(keyframes))
    };

    saveLocalScenario(newScenario);
    setScenarios(prev => [newScenario, ...prev]);
    setIsSaveModalOpen(false);
    setSavedSuccessBanner(true);
    setTimeout(() => setSavedSuccessBanner(false), 3000);
  };

  const handleLoadScenario = (sc: TacticalScenario) => {
    setIsDrillMode(sc.isDrillMode);
    if (sc.isDrillMode) {
      setHomeCount(sc.homeCount || 3);
      setAwayCount(sc.awayCount || 2);
      setThirdCount(sc.thirdCount || 0);
    }
    setNodes(sc.nodes);
    setAwayNodes(sc.awayNodes || []);
    setThirdNodes(sc.thirdNodes || []);
    setArrows(sc.arrows || []);
    setCones(sc.cones || []);
    if (sc.balls && sc.balls.length > 0) {
      setBalls(sc.balls);
    } else {
      setBalls([{ id: 'ball-1', x: sc.ballPos?.x || 50, y: sc.ballPos?.y || 50 }]);
    }
    if (sc.keyframes && sc.keyframes.length > 0) {
      setKeyframes(sc.keyframes);
      setActiveKeyframeIndex(0);
    }
    if ((sc.awayNodes && sc.awayNodes.length > 0) || (sc.thirdNodes && sc.thirdNodes.length > 0)) {
      setShowOpposition(true);
    }
    setIsScenariosLibraryOpen(false);
  };

  const handleDeleteScenario = (id: string) => {
    deleteLocalScenario(id);
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  // Dynamic reaction when 5v5 / 7v7 / 9v9 / 11v11 format changes in header
  useEffect(() => {
    if (isDrillMode) return;

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
    setThirdNodes([]);
    setIsPlayingAnimation(false);
    setBalls([{ id: 'ball-1', x: 50, y: 50 }]);
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
    setThirdNodes([]);
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

  const handleApplyDrillPreset = (hCount: number, aCount: number, tCount = 0) => {
    setIsDrillMode(true);
    setHomeCount(hCount);
    setAwayCount(aCount);
    setThirdCount(tCount);
    generateDrillNodes(hCount, aCount, tCount);
  };

  const handleUpdateHomeCount = (delta: number) => {
    const next = Math.max(1, Math.min(11, homeCount + delta));
    setHomeCount(next);
    setIsDrillMode(true);
    generateDrillNodes(next, awayCount, thirdCount);
  };

  const handleUpdateAwayCount = (delta: number) => {
    const next = Math.max(0, Math.min(11, awayCount + delta));
    setAwayCount(next);
    setIsDrillMode(true);
    generateDrillNodes(homeCount, next, thirdCount);
  };

  const handleUpdateThirdCount = (delta: number) => {
    const next = Math.max(0, Math.min(11, thirdCount + delta));
    setThirdCount(next);
    setIsDrillMode(true);
    generateDrillNodes(homeCount, awayCount, next);
  };

  const handleNodeMove = (id: string, newX: number, newY: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
  };

  const handleAwayNodeMove = (id: string, newX: number, newY: number) => {
    setAwayNodes(prev => prev.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
  };

  const handleThirdNodeMove = (id: string, newX: number, newY: number) => {
    setThirdNodes(prev => prev.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
  };

  const handleAddArrow = (arrow: TacticalArrow) => {
    setArrows(prev => [...prev, arrow]);
  };

  const handleResetBoard = () => {
    setIsPlayingAnimation(false);
    setArrows([]);
    setBalls(prev => prev.map((b, idx) => ({
      ...b,
      x: 50 + (idx % 2 === 0 ? (idx * 5) : -(idx * 5)),
      y: 50
    })));
    if (isDrillMode) {
      generateDrillNodes(homeCount, awayCount, thirdCount);
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
      setThirdNodes([]);
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
        {/* Top-Right Red Floating Quick Close Button (Guarantees user can always exit) */}
        <button
          onClick={handleExitFullscreen}
          className="fixed top-6 right-6 z-[10001] px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-2xl flex items-center gap-1.5 shadow-2xl ring-4 ring-red-950/60 active:scale-95 transition"
          title="Exit Fullscreen (Esc)"
        >
          <X className="w-4 h-4" />
          <span>Exit Fullscreen (Esc)</span>
        </button>

        {/* Fullscreen Header Bar */}
        <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur p-3.5 pr-44 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">
              TS
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                {team.name} Fullscreen Board ({team.format})
                {isDrillMode ? (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full border border-cyan-500/30 font-bold">
                    🎯 Drill Mode ({homeCount}v{awayCount}{thirdCount > 0 ? `v${thirdCount}` : ''})
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
              onClick={() => setIsAIGeneratorOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-current" /> AI Scenario
            </button>

            {/* Multi-Ball Selector ⚽ */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">⚽ Balls:</span>
              <button
                onClick={() => handleUpdateBallCount(-1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center font-black text-xs text-amber-400">{balls.length}</span>
              <button
                onClick={() => handleUpdateBallCount(1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={handleOpenSaveModal}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Scenario
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
            balls={balls}
            onMultiBallMove={handleMultiBallMove}
            awayNodes={showOpposition ? awayNodes : []}
            onAwayNodeMove={handleAwayNodeMove}
            thirdNodes={showOpposition ? thirdNodes : []}
            onThirdNodeMove={handleThirdNodeMove}
            cones={cones}
            onAddCone={handleAddCone}
            onConeMove={handleConeMove}
            onDeleteCone={handleDeleteCone}
            isPlacingCone={isPlacingCone}
            coneColor={coneColor}
            keyframes={keyframes}
            activeKeyframeIndex={activeKeyframeIndex}
            timelineProgress={timelineProgress}
          />
        </div>

        {/* Floating Bottom Touch Bar */}
        <div className="bg-slate-900/95 backdrop-blur p-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-2xl">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setIsDrawingArrow(!isDrawingArrow); setIsPlacingCone(false); }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
                isDrawingArrow
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>{isDrawingArrow ? 'Drawing Vector' : '+ Draw Vector'}</span>
            </button>

            <button
              onClick={() => { setIsPlacingCone(!isPlacingCone); setIsDrawingArrow(false); }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
                isPlacingCone
                  ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-500/30 font-black'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>🔶 {isPlacingCone ? 'Placing Cone Mode' : '+ Place Cone'}</span>
            </button>
          </div>

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

            <button
              onClick={handleExitFullscreen}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/30 active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>Exit Fullscreen</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal In-Page Mode
  return (
    <div className="space-y-6">
      {savedSuccessBanner && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          Tactical Scenario saved successfully to your Saved Scenarios Library!
        </div>
      )}

      {/* Top Banner: Mode & Save Controls */}
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
                  <Target className="w-3 h-3" /> Drill Mode ({homeCount}v{awayCount}{thirdCount > 0 ? `v${thirdCount}` : ''})
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {isDrillMode
                ? `Drill Mode active: Pick exact player count (${homeCount} Blue vs ${awayCount} Red ${thirdCount > 0 ? `vs ${thirdCount} Gold` : ''}) & ${balls.length} Ball(s)`
                : 'Drag players, opposition, cones 🔶, or soccer balls ⚽ to demonstrate plays'}
            </p>
          </div>
        </div>

        {/* Always Fullscreen Setting, AI Generator, Multi-Ball, Save Scenario & Scenarios Library Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleAlwaysFullscreen}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              alwaysFullscreen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Setting: Always open Tactics Board in Fullscreen mode"
          >
            <Monitor className="w-4 h-4" />
            <span>{alwaysFullscreen ? 'Always Fullscreen ON' : 'Default Fullscreen'}</span>
          </button>

          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>✨ AI Generator</span>
          </button>

          {/* Multi-Ball Selector ⚽ */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">⚽ Balls:</span>
            <button
              onClick={() => handleUpdateBallCount(-1)}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-black text-xs text-amber-400">{balls.length}</span>
            <button
              onClick={() => handleUpdateBallCount(1)}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleOpenSaveModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>💾 Save Scenario</span>
          </button>

          <button
            onClick={() => setIsScenariosLibraryOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
          >
            <Folder className="w-4 h-4 text-emerald-400" />
            <span>Saved Scenarios ({scenarios.length})</span>
          </button>

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
                generateDrillNodes(homeCount, awayCount, thirdCount);
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
            className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl border border-emerald-400 transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            title="Fullscreen Pitch Mode"
          >
            <Maximize2 className="w-5 h-5" />
            <span className="text-xs">Fullscreen</span>
          </button>
        </div>
      </div>

      {/* KEYFRAME SEQUENCE TIMELINE CONTROL BAR 🎬 */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-2 border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-2">
              Time Sequence Keyframe Timeline
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full border border-cyan-500/30 font-bold">
                {keyframes.length} Keyframes
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Move players/ball, draw vectors, then add time sequence keyframes to demonstrate movement over time</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Keyframe Sequence Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {keyframes.map((kf, index) => (
              <button
                key={kf.id}
                onClick={() => handleSelectKeyframe(index)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  activeKeyframeIndex === index
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {kf.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddKeyframe}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>➕ Add Time Sequence (+ Keyframe)</span>
          </button>
        </div>
      </div>

      {/* Drill Mode 3-Team Player Counter & Cone Toolbar */}
      {isDrillMode ? (
        <div className="glass-panel p-4 rounded-2xl space-y-4 border-2 border-cyan-500/30 bg-cyan-950/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Team A (Home Blue) Player Count */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Team A:
                </span>
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => handleUpdateHomeCount(-1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-black text-xs text-blue-400">{homeCount}</span>
                  <button
                    onClick={() => handleUpdateHomeCount(1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Team B (Away Red) Player Count */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-red-300 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Team B:
                </span>
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => handleUpdateAwayCount(-1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-black text-xs text-red-400">{awayCount}</span>
                  <button
                    onClick={() => handleUpdateAwayCount(1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Team C / 3rd Team (Neutrals Gold) Player Count */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Team C (3rd):
                </span>
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => handleUpdateThirdCount(-1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-black text-xs text-amber-400">{thirdCount}</span>
                  <button
                    onClick={() => handleUpdateThirdCount(1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Drill Presets */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Presets:</span>
              {[
                { label: '1v1', h: 1, a: 1, t: 0 },
                { label: '2v1 Overload', h: 2, a: 1, t: 0 },
                { label: '3v2 Counter', h: 3, a: 2, t: 0 },
                { label: '4v2 Rondo', h: 4, a: 2, t: 0 },
                { label: '3v3v3 (3 Teams)', h: 3, a: 3, t: 3 },
                { label: '4v4+3 Neutral', h: 4, a: 4, t: 3 },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handleApplyDrillPreset(preset.h, preset.a, preset.t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    homeCount === preset.h && awayCount === preset.a && thirdCount === preset.t
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
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
            balls={balls}
            onMultiBallMove={handleMultiBallMove}
            awayNodes={showOpposition ? awayNodes : []}
            onAwayNodeMove={handleAwayNodeMove}
            thirdNodes={showOpposition ? thirdNodes : []}
            onThirdNodeMove={handleThirdNodeMove}
            cones={cones}
            onAddCone={handleAddCone}
            onConeMove={handleConeMove}
            onDeleteCone={handleDeleteCone}
            isPlacingCone={isPlacingCone}
            coneColor={coneColor}
            keyframes={keyframes}
            activeKeyframeIndex={activeKeyframeIndex}
            timelineProgress={timelineProgress}
          />

          {/* Normal Mode Touch Control Bar with Advanced Vector Modes */}
          <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-2 border-emerald-500/20 shadow-xl">
            {/* Draw Mode & Vector Types */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setIsDrawingArrow(!isDrawingArrow); setIsPlacingCone(false); }}
                className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border ${
                  isDrawingArrow
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 font-black'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>{isDrawingArrow ? 'Drawing Vector Mode' : '+ Draw Vector'}</span>
              </button>

              {isDrawingArrow && (
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setArrowType('pass')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      arrowType === 'pass' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟩 Pass
                  </button>
                  <button
                    onClick={() => setArrowType('run')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      arrowType === 'run' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟦 Run Curve
                  </button>
                  <button
                    onClick={() => setArrowType('dribble')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      arrowType === 'dribble' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟧 Dribble
                  </button>
                  <button
                    onClick={() => setArrowType('shot')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      arrowType === 'shot' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟥 Shot
                  </button>
                </div>
              )}

              {/* Cone Placer Button & Grid Presets 🔶 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setIsPlacingCone(!isPlacingCone); setIsDrawingArrow(false); }}
                  className={`px-4 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border ${
                    isPlacingCone
                      ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-lg shadow-orange-500/30 font-black'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>🔶 {isPlacingCone ? 'Placing Cone Mode' : '+ Place Cone'}</span>
                </button>

                {isPlacingCone && (
                  <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                    {(['orange', 'yellow', 'blue', 'red'] as const).map(color => (
                      <button
                        key={color}
                        onClick={() => setConeColor(color)}
                        className={`w-6 h-6 rounded-full border border-white/80 transition-transform ${
                          coneColor === color ? 'scale-125 ring-2 ring-white shadow' : 'opacity-70 hover:opacity-100'
                        } ${
                          color === 'orange' ? 'bg-orange-500' : (color === 'yellow' ? 'bg-yellow-400' : (color === 'blue' ? 'bg-blue-500' : 'bg-red-500'))
                        }`}
                        title={`${color} cone`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* GSAP Motion Animation Control Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all shadow-xl ${
                  isPlayingAnimation
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-500/30 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/30 scale-105'
                }`}
                title={isPlayingAnimation ? "Pause Sequence Animation" : "Play GSAP Motion Animation"}
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
              {isDrillMode ? `3-Team Drill: ${homeCount}v${awayCount}${thirdCount > 0 ? `v${thirdCount}` : ''}` : `Active Formation: ${selectedFormation.name}`}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isDrillMode
                ? `Focuses on 3-color ${homeCount}v${awayCount}${thirdCount > 0 ? `v${thirdCount}` : ''} rondo & neutral player dynamics, rapid transition, and possession overloads.`
                : team.playingStyle === 'youth-buildout'
                ? 'Emphasizes split center backs, build-out through the goalkeeper, and aggressive trigger-based high pressing.'
                : 'Balanced positional shape maximizing field coverage and passing options.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Position Assignments:</span>
              <span className="text-[10px] text-amber-400">🎬 GSAP Motion Engine Active</span>
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

      {/* AI SCENARIO GENERATOR MODAL ✨ */}
      {isAIGeneratorOpen && (
        <AIScenarioGeneratorModal
          format={team.format}
          onClose={() => setIsAIGeneratorOpen(false)}
          onApplyScenario={handleApplyAIScenario}
        />
      )}

      {/* SAVE SCENARIO MODAL PROMPT */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmSaveScenario} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-emerald-400" /> Save Tactical Scenario
              </h3>
              <button type="button" onClick={() => setIsSaveModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Scenario Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., High-Press 3v2 Overload & Gate Drill"
                value={scenarioTitleInput}
                onChange={(e) => setScenarioTitleInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Coaching Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g., Focus on quick split passes through yellow cone gates..."
                value={scenarioDescInput}
                onChange={(e) => setScenarioDescInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Scenario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SAVED SCENARIOS LIBRARY MODAL */}
      {isScenariosLibraryOpen && (
        <SavedScenariosModal
          scenarios={scenarios}
          onClose={() => setIsScenariosLibraryOpen(false)}
          onLoadScenario={handleLoadScenario}
          onDeleteScenario={handleDeleteScenario}
        />
      )}
    </div>
  );
};
