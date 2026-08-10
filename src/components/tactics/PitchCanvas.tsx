import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { PitchNode, TacticalArrow, TacticalCone, Player, TacticalKeyframe } from '../../types';

interface PitchCanvasProps {
  nodes: PitchNode[];
  arrows: TacticalArrow[];
  playersMap: Record<string, Player>;
  onNodeMove?: (nodeId: string, newX: number, newY: number) => void;
  isDrawingArrow?: boolean;
  arrowType?: 'pass' | 'run' | 'dribble' | 'shot';
  onAddArrow?: (arrow: TacticalArrow) => void;
  isPlayingAnimation?: boolean;
  isFullscreen?: boolean;

  // Multi-Ball & Opposition props ⚽
  ballPos?: { x: number; y: number };
  onBallMove?: (x: number, y: number) => void;
  balls?: Array<{ id: string; x: number; y: number }>;
  onMultiBallMove?: (ballId: string, x: number, y: number) => void;

  awayNodes?: PitchNode[];
  onAwayNodeMove?: (nodeId: string, newX: number, newY: number) => void;
  thirdNodes?: PitchNode[];
  onThirdNodeMove?: (nodeId: string, newX: number, newY: number) => void;

  // Tactical Cones Props 🔶
  cones?: TacticalCone[];
  onAddCone?: (cone: TacticalCone) => void;
  onConeMove?: (coneId: string, newX: number, newY: number) => void;
  onDeleteCone?: (coneId: string) => void;
  isPlacingCone?: boolean;
  coneColor?: 'orange' | 'yellow' | 'blue' | 'red';

  // Keyframe Sequence Timeline Props 🎬
  keyframes?: TacticalKeyframe[];
  activeKeyframeIndex?: number;
  timelineProgress?: number; // 0.0 to 1.0
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  nodes,
  arrows,
  playersMap,
  onNodeMove,
  isDrawingArrow = false,
  arrowType = 'pass',
  onAddArrow,
  isPlayingAnimation = false,
  isFullscreen = false,
  ballPos = { x: 50, y: 50 },
  onBallMove,
  balls = [],
  onMultiBallMove,
  awayNodes = [],
  onAwayNodeMove,
  thirdNodes = [],
  onThirdNodeMove,
  cones = [],
  onAddCone,
  onConeMove,
  onDeleteCone,
  isPlacingCone = false,
  coneColor = 'orange',
  keyframes = [],
  activeKeyframeIndex = 0,
  timelineProgress = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [draggedConeId, setDraggedConeId] = useState<string | null>(null);
  const [draggedBallId, setDraggedBallId] = useState<string | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  
  // GSAP Driven 60fps Playback Interpolation Progress
  const [animProgress, setAnimProgress] = useState<number>(0);
  const animProgressRef = useRef<number>(0);

  // Normalize active balls list
  const activeBalls = React.useMemo(() => {
    if (balls && balls.length > 0) return balls;
    return [{ id: 'ball-1', x: ballPos.x, y: ballPos.y }];
  }, [balls, ballPos]);

  // GSAP Animation Loop Integration
  useEffect(() => {
    let tween: gsap.core.Tween;
    if (isPlayingAnimation) {
      tween = gsap.to(animProgressRef, {
        current: 1.0,
        duration: 3.5,
        repeat: -1,
        ease: 'power1.inOut',
        onUpdate: () => {
          setAnimProgress(animProgressRef.current);
        }
      });
    } else {
      animProgressRef.current = timelineProgress;
      setAnimProgress(timelineProgress);
    }

    return () => {
      if (tween) tween.kill();
    };
  }, [isPlayingAnimation, timelineProgress]);

  const calculateCanvasCoords = (e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 50, y: 50 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const handlePointerDown = (
    e: React.PointerEvent,
    node?: PitchNode,
    targetBallId?: string,
    cone?: TacticalCone
  ) => {
    const { x, y } = calculateCanvasCoords(e);

    if (targetBallId) {
      setDraggedBallId(targetBallId);
      if (onMultiBallMove) onMultiBallMove(targetBallId, x, y);
      else if (onBallMove) onBallMove(x, y);
      e.stopPropagation();
    } else if (cone && onConeMove) {
      setDraggedConeId(cone.id);
      e.stopPropagation();
    } else if (isPlacingCone && onAddCone) {
      onAddCone({
        id: 'cone-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        x,
        y,
        color: coneColor
      });
    } else if (isDrawingArrow) {
      setDrawingStart({ x, y });
      setCurrentMousePos({ x, y });
    } else if (node) {
      setDraggedNodeId(node.id);
      e.stopPropagation();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { x, y } = calculateCanvasCoords(e);

    if (draggedBallId) {
      if (onMultiBallMove) onMultiBallMove(draggedBallId, x, y);
      else if (onBallMove) onBallMove(x, y);
    } else if (draggedConeId && onConeMove) {
      onConeMove(draggedConeId, x, y);
    } else if (draggedNodeId) {
      const isAway = awayNodes.some(n => n.id === draggedNodeId);
      const isThird = thirdNodes.some(n => n.id === draggedNodeId);
      if (isAway && onAwayNodeMove) {
        onAwayNodeMove(draggedNodeId, x, y);
      } else if (isThird && onThirdNodeMove) {
        onThirdNodeMove(draggedNodeId, x, y);
      } else if (onNodeMove) {
        onNodeMove(draggedNodeId, x, y);
      }
    } else if (drawingStart) {
      setCurrentMousePos({ x, y });
    }
  };

  const handlePointerUp = () => {
    if (drawingStart && currentMousePos && onAddArrow) {
      onAddArrow({
        id: 'arrow-' + Date.now(),
        startX: drawingStart.x,
        startY: drawingStart.y,
        endX: currentMousePos.x,
        endY: currentMousePos.y,
        type: arrowType
      });
    }
    setDraggedNodeId(null);
    setDraggedConeId(null);
    setDraggedBallId(null);
    setDrawingStart(null);
    setCurrentMousePos(null);
  };

  // Tactical Cone Color Map
  const coneColorStyles = {
    orange: 'from-amber-400 to-orange-600 border-amber-300 ring-orange-950/50',
    yellow: 'from-yellow-300 to-amber-500 border-yellow-200 ring-yellow-950/50',
    blue: 'from-cyan-400 to-blue-600 border-cyan-200 ring-blue-950/50',
    red: 'from-rose-400 to-red-600 border-rose-200 ring-red-950/50'
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerDown={(e) => handlePointerDown(e)}
      className={`relative w-full bg-emerald-900 overflow-hidden shadow-2xl border-4 border-emerald-950 select-none touch-none pitch-bg pitch-stripe transition-all duration-300 ${
        isPlacingCone ? 'cursor-crosshair' : ''
      } ${
        isFullscreen
          ? 'h-full flex-1 rounded-3xl border-none shadow-none'
          : 'aspect-[4/3] md:aspect-[16/10] rounded-2xl'
      }`}
    >
      {/* Field Markings & Tactical Vectors Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/40 fill-none stroke-[2]">
        {/* Outer Boundary */}
        <rect x="3%" y="3%" width="94%" height="94%" rx="8" />
        {/* Halfway Line */}
        <line x1="3%" y1="50%" x2="97%" y2="50%" />
        {/* Center Circle */}
        <circle cx="50%" cy="50%" r="14%" />
        <circle cx="50%" cy="50%" r="1%" fill="white" className="fill-white/60" />

        {/* Penalty Area Top */}
        <rect x="24%" y="3%" width="52%" height="20%" />
        <rect x="36%" y="3%" width="28%" height="8%" />

        {/* Penalty Area Bottom */}
        <rect x="24%" y="77%" width="52%" height="20%" />
        <rect x="36%" y="89%" width="28%" height="8%" />

        {/* Goals */}
        <rect x="40%" y="0.5%" width="20%" height="2.5%" fill="rgba(255,255,255,0.2)" />
        <rect x="40%" y="97%" width="20%" height="2.5%" fill="rgba(255,255,255,0.2)" />

        {/* Advanced Curved & Wavy Vector Arrow Layer ↗️ */}
        {arrows.map(arrow => {
          const colorMap = {
            pass: '#10b981',    // Emerald Green
            run: '#3b82f6',     // Royal Blue
            dribble: '#f59e0b', // Amber Gold
            shot: '#ef4444'     // Bright Red
          };
          const stroke = colorMap[arrow.type] || '#10b981';

          // Curved Bezier Control point for curved runs & wavy dribbles
          const midX = (arrow.startX + arrow.endX) / 2;
          const midY = (arrow.startY + arrow.endY) / 2;
          const dx = arrow.endX - arrow.startX;
          const dy = arrow.endY - arrow.startY;
          
          // Perpendicular offset for organic player run curves
          const curveOffsetX = midX - dy * 0.18;
          const curveOffsetY = midY + dx * 0.18;

          if (arrow.type === 'run') {
            // Curved Dashed Blue Player Run Vector
            const pathData = `M ${arrow.startX} ${arrow.startY} Q ${curveOffsetX} ${curveOffsetY} ${arrow.endX} ${arrow.endY}`;
            return (
              <g key={arrow.id}>
                <path
                  d={pathData}
                  stroke={stroke}
                  strokeWidth="4"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  fill="none"
                  opacity={isPlayingAnimation ? 0.5 : 1}
                />
                <circle cx={`${arrow.endX}%`} cy={`${arrow.endY}%`} r="6" fill={stroke} opacity={isPlayingAnimation ? 0.5 : 1} />
              </g>
            );
          } else if (arrow.type === 'dribble') {
            // Wavy Amber Dribble Carrying Vector
            const waveX1 = arrow.startX + dx * 0.3 + dy * 0.1;
            const waveY1 = arrow.startY + dy * 0.3 - dx * 0.1;
            const waveX2 = arrow.startX + dx * 0.7 - dy * 0.1;
            const waveY2 = arrow.startY + dy * 0.7 + dx * 0.1;
            const pathData = `M ${arrow.startX} ${arrow.startY} C ${waveX1} ${waveY1}, ${waveX2} ${waveY2}, ${arrow.endX} ${arrow.endY}`;
            return (
              <g key={arrow.id}>
                <path
                  d={pathData}
                  stroke={stroke}
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  opacity={isPlayingAnimation ? 0.5 : 1}
                />
                <circle cx={`${arrow.endX}%`} cy={`${arrow.endY}%`} r="6" fill={stroke} opacity={isPlayingAnimation ? 0.5 : 1} />
              </g>
            );
          } else {
            // Solid Vector (Pass / Shot)
            return (
              <g key={arrow.id}>
                <line
                  x1={`${arrow.startX}%`}
                  y1={`${arrow.startY}%`}
                  x2={`${arrow.endX}%`}
                  y2={`${arrow.endY}%`}
                  stroke={stroke}
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity={isPlayingAnimation ? 0.5 : 1}
                />
                <circle cx={`${arrow.endX}%`} cy={`${arrow.endY}%`} r="6" fill={stroke} opacity={isPlayingAnimation ? 0.5 : 1} />
              </g>
            );
          }
        })}

        {/* Live Drawing Arrow preview */}
        {drawingStart && currentMousePos && (
          <line
            x1={`${drawingStart.x}%`}
            y1={`${drawingStart.y}%`}
            x2={`${currentMousePos.x}%`}
            y2={`${currentMousePos.y}%`}
            stroke="#fbbf24"
            strokeWidth="4"
            strokeDasharray="4 4"
          />
        )}
      </svg>

      {/* Tactical Cones Layer 🔶 */}
      {cones.map(cone => {
        const isSelected = draggedConeId === cone.id;
        const colorStyle = coneColorStyles[cone.color] || coneColorStyles.orange;

        return (
          <div
            key={cone.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              handlePointerDown(e, undefined, undefined, cone);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (onDeleteCone) onDeleteCone(cone.id);
            }}
            style={{ left: `${cone.x}%`, top: `${cone.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-15 touch-none transition-transform duration-75 ${
              isSelected ? 'scale-125 z-30' : 'hover:scale-125'
            }`}
            title="Tactical Cone (Drag to move, double click to delete)"
          >
            <div className="relative group flex flex-col items-center">
              <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr ${colorStyle} border border-white/80 shadow-lg flex items-center justify-center ring-2`}>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950/60"></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 3rd Team Nodes Layer (Team C / Neutrals - Gold 🟡) */}
      {thirdNodes.map(node => {
        const isSelected = draggedNodeId === node.id;
        return (
          <div
            key={node.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              handlePointerDown(e, node);
            }}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform duration-75 touch-none ${
              isSelected ? 'scale-125 z-35' : 'z-25 hover:scale-110'
            }`}
          >
            <div className="relative group flex flex-col items-center">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-amber-400 border-2 border-slate-950 shadow-xl flex items-center justify-center font-black text-slate-950 text-xs ring-4 ring-amber-950/40">
                {node.label}
              </div>
              <div className="mt-1 px-1.5 py-0.5 bg-amber-950/90 text-amber-200 text-[9px] md:text-[10px] rounded font-semibold whitespace-nowrap border border-amber-500/40">
                NEUTRAL ({node.role})
              </div>
            </div>
          </div>
        );
      })}

      {/* Opposition Nodes Layer (Away Team B - Red 🔴) */}
      {awayNodes.map(node => {
        const isSelected = draggedNodeId === node.id;
        return (
          <div
            key={node.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              handlePointerDown(e, node);
            }}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform duration-75 touch-none ${
              isSelected ? 'scale-125 z-30' : 'z-20 hover:scale-110'
            }`}
          >
            <div className="relative group flex flex-col items-center">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center font-bold text-white text-xs ring-4 ring-red-950/40">
                {node.label}
              </div>
              <div className="mt-1 px-1.5 py-0.5 bg-red-950/90 text-red-200 text-[9px] md:text-[10px] rounded font-semibold whitespace-nowrap border border-red-500/30">
                AWAY ({node.role})
              </div>
            </div>
          </div>
        );
      })}

      {/* Home Players / Nodes Layer (Team A - Royal Blue 🔵) */}
      {nodes.map(node => {
        const player = node.assignedPlayerId ? playersMap[node.assignedPlayerId] : null;
        const isSelected = draggedNodeId === node.id;

        let currentX = node.x;
        let currentY = node.y;

        if (animProgress > 0) {
          const matchingArrow = arrows.find(a => 
            Math.hypot(node.x - a.startX, node.y - a.startY) < 12 ||
            Math.hypot(node.x - a.endX, node.y - a.endY) < 12
          );

          if (matchingArrow) {
            const nearStart = Math.hypot(node.x - matchingArrow.startX, node.y - matchingArrow.startY) < 12;
            const startX = nearStart ? matchingArrow.startX : matchingArrow.endX;
            const startY = nearStart ? matchingArrow.startY : matchingArrow.endY;
            const endX = nearStart ? matchingArrow.endX : matchingArrow.startX;
            const endY = nearStart ? matchingArrow.endY : matchingArrow.startY;

            currentX = startX + (endX - startX) * animProgress;
            currentY = startY + (endY - startY) * animProgress;
          }
        }

        return (
          <div
            key={node.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              handlePointerDown(e, node);
            }}
            style={{ left: `${currentX}%`, top: `${currentY}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform duration-75 touch-none ${
              isSelected ? 'scale-125 z-30' : 'z-20 hover:scale-110'
            }`}
          >
            <div className="relative group flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-xl flex items-center justify-center font-bold text-white text-xs md:text-sm transition-transform ${
                  node.role === 'GK'
                    ? 'bg-blue-700 ring-4 ring-amber-400'
                    : 'bg-blue-600 ring-4 ring-blue-900/60'
                } ${
                  isPlayingAnimation ? 'ring-cyan-400/80 shadow-cyan-500/60 animate-pulse' : ''
                }`}
              >
                {player ? `#${Number(player.number)}` : node.label}
              </div>

              <div className="mt-1 px-2 py-0.5 bg-slate-950/85 backdrop-blur text-white text-[10px] md:text-xs rounded font-medium shadow whitespace-nowrap border border-white/10">
                {player ? player.name.split(' ')[0] : node.label} ({node.role})
              </div>
            </div>
          </div>
        );
      })}

      {/* Interactive Multi-Ball Nodes Layer ⚽ (Supports N Draggable Soccer Balls) */}
      {activeBalls.map((ball, idx) => {
        let currentBallX = ball.x;
        let currentBallY = ball.y;

        if (idx === 0 && animProgress > 0 && arrows.length > 0) {
          const passArrow = arrows.find(a => a.type === 'pass' || a.type === 'shot') || arrows[0];
          if (passArrow) {
            currentBallX = passArrow.startX + (passArrow.endX - passArrow.startX) * animProgress;
            currentBallY = passArrow.startY + (passArrow.endY - passArrow.startY) * animProgress;
          }
        }

        const isSelected = draggedBallId === ball.id;

        return (
          <div
            key={ball.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
              handlePointerDown(e, undefined, ball.id);
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ left: `${currentBallX}%`, top: `${currentBallY}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-50 p-2 touch-none select-none transition-transform duration-75 ${
              isSelected ? 'scale-125' : 'hover:scale-125'
            }`}
            title={`Soccer Ball ${idx + 1} ⚽ (Draggable anywhere on pitch)`}
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-slate-950 flex items-center justify-center text-xl md:text-2xl shadow-2xl border-2 border-slate-950 ring-4 ${
              isSelected ? 'ring-amber-400 scale-110 shadow-amber-500/50' : 'ring-amber-400/80'
            }`}>
              ⚽
            </div>
          </div>
        );
      })}
    </div>
  );
};
