import React, { useState } from 'react';
import { Drill, DrillKeyframe, Team, PitchNode, TacticalArrow } from '../../types';
import { PitchCanvas } from '../tactics/PitchCanvas';
import { X, Plus, Trash2, Save, Layers, PenTool, CheckCircle, Sparkles, RotateCcw } from 'lucide-react';

interface CustomDrillModalProps {
  team: Team;
  initialDrill?: Drill | null;
  onClose: () => void;
  onSave: (drill: Drill) => void;
}

export const CustomDrillModal: React.FC<CustomDrillModalProps> = ({
  team,
  initialDrill,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState<string>(initialDrill?.title || '');
  const [category, setCategory] = useState<Drill['category']>(initialDrill?.category || 'Passing');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDrill?.durationMinutes || 15);
  const [description, setDescription] = useState<string>(initialDrill?.description || '');
  const [coachingPoints, setCoachingPoints] = useState<string[]>(
    initialDrill?.coachingPoints || ['First touch out of feet', 'Scanning before receiving', 'Communicate early']
  );
  const [newPointInput, setNewPointInput] = useState<string>('');

  // Initial keyframes state
  const [keyframes, setKeyframes] = useState<DrillKeyframe[]>(() => {
    if (initialDrill && initialDrill.keyframes.length > 0) {
      return initialDrill.keyframes;
    }
    // Default starting keyframe for Step 1
    return [
      {
        id: 'step-1',
        stepNumber: 1,
        description: 'Step 1: Initial player positioning & opening pass',
        nodes: [
          { id: 'n1', label: '1', role: 'GK', x: 50, y: 88, team: 'home' },
          { id: 'n2', label: '2', role: 'LB', x: 25, y: 70, team: 'home' },
          { id: 'n3', label: '3', role: 'RB', x: 75, y: 70, team: 'home' },
          { id: 'n4', label: '4', role: 'CM', x: 50, y: 50, team: 'home' },
          { id: 'n5', label: '5', role: 'ST', x: 50, y: 22, team: 'home' },
        ],
        arrows: [
          { id: 'a1', startX: 50, startY: 88, endX: 25, endY: 70, type: 'pass' }
        ]
      }
    ];
  });

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isDrawingArrow, setIsDrawingArrow] = useState<boolean>(false);
  const [arrowType, setArrowType] = useState<'pass' | 'run' | 'dribble' | 'shot'>('pass');
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [showOpposition, setShowOpposition] = useState<boolean>(false);

  const [awayNodes, setAwayNodes] = useState<PitchNode[]>([
    { id: 'away-1', label: 'A1', role: 'ST', x: 50, y: 40, team: 'away' },
    { id: 'away-2', label: 'A2', role: 'LW', x: 30, y: 45, team: 'away' },
    { id: 'away-3', label: 'A3', role: 'RW', x: 70, y: 45, team: 'away' },
  ]);

  const currentKeyframe = keyframes[activeStepIndex] || keyframes[0];

  const playersMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    team.roster.forEach(p => { map[p.id] = p; });
    return map;
  }, [team.roster]);

  const handleUpdateStepDescription = (text: string) => {
    setKeyframes(prev => prev.map((kf, i) => i === activeStepIndex ? { ...kf, description: text } : kf));
  };

  const handleNodeMove = (nodeId: string, newX: number, newY: number) => {
    setKeyframes(prev => prev.map((kf, i) => {
      if (i !== activeStepIndex) return kf;
      return {
        ...kf,
        nodes: kf.nodes.map(n => n.id === nodeId ? { ...n, x: newX, y: newY } : n)
      };
    }));
  };

  const handleAwayNodeMove = (nodeId: string, newX: number, newY: number) => {
    setAwayNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleAddArrow = (arrow: TacticalArrow) => {
    setKeyframes(prev => prev.map((kf, i) => {
      if (i !== activeStepIndex) return kf;
      return {
        ...kf,
        arrows: [...kf.arrows, arrow]
      };
    }));
  };

  const handleClearStepLines = () => {
    setKeyframes(prev => prev.map((kf, i) => i === activeStepIndex ? { ...kf, arrows: [] } : kf));
  };

  const handleAddStep = () => {
    const nextStepNum = keyframes.length + 1;
    const lastKf = keyframes[keyframes.length - 1];
    const newKf: DrillKeyframe = {
      id: 'step-' + Date.now(),
      stepNumber: nextStepNum,
      description: `Step ${nextStepNum}: Movement & continuation`,
      nodes: JSON.parse(JSON.stringify(lastKf.nodes)),
      arrows: []
    };
    setKeyframes(prev => [...prev, newKf]);
    setActiveStepIndex(keyframes.length);
  };

  const handleDeleteStep = (indexToDelete: number) => {
    if (keyframes.length <= 1) return;
    const filtered = keyframes.filter((_, i) => i !== indexToDelete).map((kf, i) => ({
      ...kf,
      stepNumber: i + 1
    }));
    setKeyframes(filtered);
    setActiveStepIndex(Math.max(0, indexToDelete - 1));
  };

  const handleAddCoachingPoint = () => {
    if (!newPointInput.trim()) return;
    setCoachingPoints(prev => [...prev, newPointInput.trim()]);
    setNewPointInput('');
  };

  const handleRemoveCoachingPoint = (idx: number) => {
    setCoachingPoints(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const customDrill: Drill = {
      id: initialDrill?.id || 'custom-drill-' + Date.now(),
      title: title.trim(),
      category,
      ageGroup: team.ageGroup,
      durationMinutes,
      description: description.trim() || 'Custom coach designed tactical drill.',
      coachingPoints: coachingPoints.length > 0 ? coachingPoints : ['Focus on technique & communication'],
      keyframes,
      isCustom: true
    };

    onSave(customDrill);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                {initialDrill ? 'Edit Custom Drill Studio' : '➕ Custom Drill Creator Studio'}
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/30 font-medium">
                  Interactive Board
                </span>
              </h2>
              <p className="text-xs text-slate-400">Design step-by-step 2D illustrated drills for {team.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmitSave} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Drill Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., 3v2 Counter-Attack & Wing Overload"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Drill['category'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Passing">Passing &amp; Receiving</option>
                <option value="Possession">Possession &amp; Build-Out</option>
                <option value="Shooting">Shooting &amp; Finishing</option>
                <option value="Defending">Defending &amp; Pressing</option>
                <option value="Small-Sided Game">Small-Sided Game</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Estimated Duration (mins)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Drill Summary / Objective</label>
              <input
                type="text"
                placeholder="Brief summary of setup, grid dimensions, and objective..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Interactive Keyframe Pitch Board Editor */}
          <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">Visual Step Keyframes ({keyframes.length} steps)</span>
              </div>

              {/* Step Tabs & Add Step */}
              <div className="flex items-center space-x-2 overflow-x-auto">
                {keyframes.map((kf, idx) => (
                  <div key={kf.id} className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        activeStepIndex === idx
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      Step {idx + 1}
                    </button>
                    {keyframes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStep(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                        title={`Delete Step ${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>
            </div>

            {/* Current Step Description Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Instruction for Step {activeStepIndex + 1}:</label>
              <input
                type="text"
                placeholder={`Description for Step ${activeStepIndex + 1}...`}
                value={currentKeyframe.description}
                onChange={(e) => handleUpdateStepDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Step Drawing Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDrawingArrow(!isDrawingArrow)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    isDrawingArrow
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{isDrawingArrow ? 'Drawing Vector' : '+ Draw Line'}</span>
                </button>

                {isDrawingArrow && (
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['pass', 'run', 'dribble', 'shot'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setArrowType(t)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize ${
                          arrowType === t ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOpposition(!showOpposition)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                    showOpposition ? 'bg-red-600 text-white border-red-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {showOpposition ? 'Opposition On' : '+ Opposition'}
                </button>

                <button
                  type="button"
                  onClick={handleClearStepLines}
                  className="p-2 bg-slate-950 text-slate-400 hover:text-red-400 border border-slate-800 rounded-xl transition"
                  title="Clear Step Lines"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pitch Editor Canvas */}
            <div className="h-72 md:h-80 w-full relative overflow-hidden rounded-xl border border-slate-800">
              <PitchCanvas
                nodes={currentKeyframe.nodes}
                arrows={currentKeyframe.arrows}
                playersMap={playersMap}
                onNodeMove={handleNodeMove}
                isDrawingArrow={isDrawingArrow}
                arrowType={arrowType}
                onAddArrow={handleAddArrow}
                isPlayingAnimation={false}
                isFullscreen={false}
                ballPos={ballPos}
                onBallMove={(x, y) => setBallPos({ x, y })}
                awayNodes={showOpposition ? awayNodes : []}
                onAwayNodeMove={handleAwayNodeMove}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              💡 Drag players, soccer ball ⚽, or draw arrows on the pitch above to design Step {activeStepIndex + 1}
            </p>
          </div>

          {/* Key Coaching Points Input */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Key Coaching Points
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="e.g. Call for the ball early, body shape open..."
                value={newPointInput}
                onChange={(e) => setNewPointInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCoachingPoint();
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCoachingPoint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700"
              >
                + Add Point
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {coachingPoints.map((point, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                  <span>• {point}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoachingPoint(idx)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Custom Drill to Studio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
