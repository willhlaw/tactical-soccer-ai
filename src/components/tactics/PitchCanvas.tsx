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
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  nodes,
  arrows,
  playersMap,
  onNodeMove,
  isDrawingArrow = false,
  arrowType = 'pass',
  onAddArrow
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, node?: PitchNode) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isDrawingArrow) {
      setDrawingStart({ x, y });
      setCurrentMousePos({ x, y });
    } else if (node && onNodeMove) {
      setDraggedNodeId(node.id);
      e.stopPropagation();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

    if (draggedNodeId && onNodeMove) {
      onNodeMove(draggedNodeId, x, y);
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
    setDrawingStart(null);
    setCurrentMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerDown={(e) => handlePointerDown(e)}
      className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-emerald-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-950 select-none touch-none pitch-bg pitch-stripe"
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
              />
              {/* Arrow Head */}
              <circle cx={`${arrow.endX}%`} cy={`${arrow.endY}%`} r="6" fill={stroke} />
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

      {/* Players / Nodes Layer */}
      {nodes.map(node => {
        const player = node.assignedPlayerId ? playersMap[node.assignedPlayerId] : null;
        const isSelected = draggedNodeId === node.id;

        return (
          <div
            key={node.id}
            onPointerDown={(e) => handlePointerDown(e, node)}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform duration-75 ${
              isSelected ? 'scale-125 z-30' : 'z-20 hover:scale-110'
            }`}
          >
            {/* Player Marker Badge */}
            <div className="relative group flex flex-col items-center">
              <div
                style={{ backgroundColor: player?.avatarColor || (node.role === 'GK' ? '#fbbf24' : '#10b981') }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-xl flex items-center justify-center font-bold text-white text-xs md:text-sm ring-4 ring-black/20"
              >
                {player ? `#${player.number}` : node.label}
              </div>

              {/* Player Name / Role Tag */}
              <div className="mt-1 px-2 py-0.5 bg-slate-950/85 backdrop-blur text-white text-[10px] md:text-xs rounded font-medium shadow whitespace-nowrap border border-white/10">
                {player ? player.name.split(' ')[0] : node.label} ({node.role})
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
