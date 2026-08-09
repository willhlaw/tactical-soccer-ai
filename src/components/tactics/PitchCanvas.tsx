import React, { useRef, useEffect, useState } from 'react';
import { PitchNode, TacticalArrow, Player } from '../../types';

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

  // Ball & Opposition props
  ballPos?: { x: number; y: number };
  onBallMove?: (x: number, y: number) => void;
  awayNodes?: PitchNode[];
  onAwayNodeMove?: (nodeId: string, newX: number, newY: number) => void;
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
  awayNodes = [],
  onAwayNodeMove
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isDraggingBall, setIsDraggingBall] = useState<boolean>(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  
  // Animation state: freeze progress on pause instead of resetting!
  const [animProgress, setAnimProgress] = useState<number>(0);
  const animProgressRef = useRef<number>(0);

  // 60fps Animation Loop with Pause Freeze
  useEffect(() => {
    let animFrame: number;
    let lastTime: number | null = null;
    const SPEED = 0.0004; // Movement speed factor per ms

    if (isPlayingAnimation) {
      const animate = (timestamp: number) => {
        if (lastTime === null) lastTime = timestamp;
        const delta = timestamp - lastTime;
        lastTime = timestamp;

        animProgressRef.current = (animProgressRef.current + delta * SPEED) % 1.0;
        setAnimProgress(animProgressRef.current);
        animFrame = requestAnimationFrame(animate);
      };
      animFrame = requestAnimationFrame(animate);
    } else {
      lastTime = null;
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isPlayingAnimation]);

  const calculateCanvasCoords = (e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 50, y: 50 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent, node?: PitchNode, isBall = false) => {
    const { x, y } = calculateCanvasCoords(e);

    if (isBall && onBallMove) {
      setIsDraggingBall(true);
      onBallMove(x, y);
      e.stopPropagation();
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

    if (isDraggingBall && onBallMove) {
      onBallMove(x, y);
    } else if (draggedNodeId) {
      const isAway = awayNodes.some(n => n.id === draggedNodeId);
      if (isAway && onAwayNodeMove) {
        onAwayNodeMove(draggedNodeId, x, y);
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
    setIsDraggingBall(false);
    setDrawingStart(null);
    setCurrentMousePos(null);
  };

  // Animate Ball along Pass/Shot Arrow if animation is active
  let animatedBallX = ballPos.x;
  let animatedBallY = ballPos.y;

  if (isPlayingAnimation && animProgress > 0 && arrows.length > 0) {
    const passArrow = arrows.find(a => a.type === 'pass' || a.type === 'shot') || arrows[0];
    if (passArrow) {
      animatedBallX = passArrow.startX + (passArrow.endX - passArrow.startX) * animProgress;
      animatedBallY = passArrow.startY + (passArrow.endY - passArrow.startY) * animProgress;
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerDown={(e) => handlePointerDown(e)}
      className={`relative w-full bg-emerald-900 overflow-hidden shadow-2xl border-4 border-emerald-950 select-none touch-none pitch-bg pitch-stripe transition-all duration-300 ${
        isFullscreen
          ? 'h-full flex-1 rounded-3xl border-none shadow-none'
          : 'aspect-[4/3] md:aspect-[16/10] rounded-2xl'
      }`}
    >
      {/* Field Markings Layer */}
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

        {/* Tactical Arrows Layer */}
        {arrows.map(arrow => {
          const colorMap = {
            pass: '#10b981',
            run: '#3b82f6',
            dribble: '#f59e0b',
            shot: '#ef4444'
          };
          const stroke = colorMap[arrow.type] || '#10b981';
          const isDashed = arrow.type === 'run';

          return (
            <g key={arrow.id}>
              <line
                x1={`${arrow.startX}%`}
                y1={`${arrow.startY}%`}
                x2={`${arrow.endX}%`}
                y2={`${arrow.endY}%`}
                stroke={stroke}
                strokeWidth="4"
                strokeDasharray={isDashed ? '6 4' : 'none'}
                strokeLinecap="round"
                opacity={isPlayingAnimation ? 0.4 : 1}
              />
              <circle cx={`${arrow.endX}%`} cy={`${arrow.endY}%`} r="6" fill={stroke} opacity={isPlayingAnimation ? 0.5 : 1} />
            </g>
          );
        })}

        {/* Live Drawing Arrow */}
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

      {/* Opposition Nodes Layer (Away Team - Red) */}
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

      {/* Home Players / Nodes Layer */}
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

      {/* Interactive Soccer Ball Node ⚽ (Optimized Pointer Capture & 48px Hit Box) */}
      <div
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          handlePointerDown(e, undefined, true);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ left: `${animatedBallX}%`, top: `${animatedBallY}%` }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-50 p-2 touch-none select-none transition-transform duration-75 ${
          isDraggingBall ? 'scale-125' : 'hover:scale-125'
        }`}
        title="Soccer Ball ⚽ (Draggable anywhere on pitch)"
      >
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-slate-950 flex items-center justify-center text-xl md:text-2xl shadow-2xl border-2 border-slate-950 ring-4 ${
          isDraggingBall ? 'ring-amber-400 scale-110 shadow-amber-500/50' : 'ring-amber-400/80'
        }`}>
          ⚽
        </div>
      </div>
    </div>
  );
};
