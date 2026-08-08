import React, { useState, useEffect } from 'react';
import { Team, MatchSubShift, Player } from '../../types';
import { FORMATION_PRESETS } from '../../services/formations';
import { generateMatchSubPlan } from '../../services/lineupGenerator';
import { Play, Pause, RotateCcw, UserX, UserCheck, Shield, Clock, Users, Award, ChevronRight } from 'lucide-react';

interface GameDayManagerProps {
  team: Team;
  onUpdateTeam: (updatedTeam: Team) => void;
}

export const GameDayManager: React.FC<GameDayManagerProps> = ({ team, onUpdateTeam }) => {
  const [gameMode, setGameMode] = useState<'recreation' | 'competitive'>('recreation');
  const [matchDuration, setMatchDuration] = useState<number>(40); // 40 mins default
  const [subInterval, setSubInterval] = useState<number>(8); // 8 min shifts default
  
  // Timer State
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeShiftIndex, setActiveShiftIndex] = useState(0);

  // Sub Plan Matrix State
  const [subPlan, setSubPlan] = useState<MatchSubShift[]>([]);

  const formation = FORMATION_PRESETS.find(f => f.format === team.format) || FORMATION_PRESETS[2];

  // Re-calculate substitution plan matrix
  const handleGeneratePlan = () => {
    const plan = generateMatchSubPlan({
      roster: team.roster,
      formation,
      gameMode,
      totalDurationMinutes: matchDuration,
      subIntervalMinutes: subInterval,
      playingStyle: team.playingStyle
    });
    setSubPlan(plan);
    setActiveShiftIndex(0);
  };

  useEffect(() => {
    handleGeneratePlan();
  }, [team.roster, team.format, gameMode, matchDuration, subInterval]);

  // Match Timer interval tick
  useEffect(() => {
    let timer: any;
    if (isClockRunning) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          const currentShift = Math.min(
            subPlan.length - 1,
            Math.floor(next / (subInterval * 60))
          );
          if (currentShift !== activeShiftIndex) {
            setActiveShiftIndex(currentShift);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isClockRunning, subInterval, subPlan.length, activeShiftIndex]);

  const togglePlayerAbsence = (playerId: string) => {
    const updatedRoster = team.roster.map(p => 
      p.id === playerId ? { ...p, isAbsent: !p.isAbsent } : p
    );
    onUpdateTeam({
      ...team,
      roster: updatedRoster
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentShift = subPlan[activeShiftIndex] || subPlan[0];
  const absentCount = team.roster.filter(p => p.isAbsent).length;
  const presentCount = team.roster.length - absentCount;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Game Day Mode & Timer Control Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-emerald-500 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-black text-white">Game Day Sub Optimizer</h2>
            <span className={`px-3 py-1 text-xs rounded-full font-bold border ${
              gameMode === 'recreation'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {gameMode === 'recreation' ? 'Rec Mode (Equal Minutes)' : 'Competitive Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {presentCount} Active Players • {absentCount} Absent • Shift {activeShiftIndex + 1} of {subPlan.length}
          </p>
        </div>

        {/* Live Match Clock Touch Widget */}
        <div className="flex items-center space-x-4 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
          <div className="text-center px-2">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Match Clock</div>
            <div className="text-2xl md:text-3xl font-black font-mono text-emerald-400 tracking-wider">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsClockRunning(!isClockRunning)}
              className={`min-w-[50px] min-h-[50px] rounded-2xl flex items-center justify-center font-bold transition shadow-lg active:scale-95 ${
                isClockRunning
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                  : 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              {isClockRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => { setIsClockRunning(false); setElapsedSeconds(0); setActiveShiftIndex(0); }}
              className="min-w-[44px] min-h-[44px] rounded-2xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition active:scale-95"
              title="Reset Match Clock"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mode & Absence Settings Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rec vs Competitive Mode Toggle */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 border border-slate-800">
          <label className="text-xs font-bold text-slate-300">Engine Mode:</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setGameMode('recreation')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                gameMode === 'recreation' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" /> Rec (Equal Min)
            </button>
            <button
              onClick={() => setGameMode('competitive')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                gameMode === 'competitive' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
              }`}
            >
              <Award className="w-4 h-4" /> Competitive
            </button>
          </div>
        </div>

        {/* Duration Controls */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 border border-slate-800">
          <label className="text-xs font-bold text-slate-300">Shift Intervals:</label>
          <div className="flex items-center space-x-2">
            <select
              value={matchDuration}
              onChange={(e) => setMatchDuration(Number(e.target.value))}
              className="min-h-[44px] flex-1 bg-slate-900 text-white text-xs px-3 py-2.5 rounded-2xl border border-slate-700"
            >
              <option value={30}>30 Min Match</option>
              <option value={40}>40 Min Match</option>
              <option value={50}>50 Min Match</option>
              <option value={60}>60 Min Match</option>
            </select>
            <select
              value={subInterval}
              onChange={(e) => setSubInterval(Number(e.target.value))}
              className="min-h-[44px] flex-1 bg-slate-900 text-white text-xs px-3 py-2.5 rounded-2xl border border-slate-700"
            >
              <option value={5}>5 Min Shifts</option>
              <option value={8}>8 Min Shifts</option>
              <option value={10}>10 Min Shifts</option>
            </select>
          </div>
        </div>

        {/* 1-Tap Attendance Check-off */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">1-Tap Attendance Check-Off:</label>
            <span className="text-[10px] text-emerald-400 font-semibold">{presentCount} Present</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {team.roster.map(p => (
              <button
                key={p.id}
                onClick={() => togglePlayerAbsence(p.id)}
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 ${
                  p.isAbsent
                    ? 'bg-red-500/20 text-red-300 border-red-500/30 line-through'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {p.isAbsent ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                #{p.number} {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Shift Pitch View & Bench Matrix */}
      {currentShift && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Field Starting Lineup */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-3xl space-y-4 border border-emerald-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Shift {currentShift.shiftIndex + 1} Lineup (Min {currentShift.startTime}&ndash;{currentShift.endTime})
                </h3>
                <p className="text-xs text-slate-400">Position allocations tailored to {team.playingStyle}</p>
              </div>

              <div className="flex items-center space-x-1.5">
                {subPlan.map((s, idx) => (
                  <button
                    key={s.shiftIndex}
                    onClick={() => setActiveShiftIndex(idx)}
                    className={`min-w-[36px] min-h-[36px] rounded-xl text-xs font-black transition active:scale-95 ${
                      idx === activeShiftIndex
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    S{s.shiftIndex + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Players Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentShift.fieldLineup.map(item => {
                const player = team.roster.find(p => p.id === item.playerId);
                if (!player) return null;
                return (
                  <div key={item.playerId} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded border border-emerald-500/30">
                        {item.role}
                      </span>
                      <span className="text-[10px] text-slate-400">#{player.number}</span>
                    </div>
                    <div className="font-bold text-white text-xs truncate">{player.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Bench Substitutes */}
          <div className="glass-panel p-5 rounded-3xl space-y-4 border border-slate-800">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-amber-400" />
              Bench Substitutes ({currentShift.benchPlayerIds.length})
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {currentShift.benchPlayerIds.map(id => {
                const player = team.roster.find(p => p.id === id);
                if (!player) return null;
                return (
                  <div key={id} className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        style={{ backgroundColor: player.avatarColor || '#10b981' }}
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                      >
                        #{player.number}
                      </div>
                      <div className="font-bold text-slate-200 text-xs">{player.name}</div>
                    </div>
                    <span className="text-[10px] text-amber-400 font-semibold px-2 py-1 bg-amber-500/10 rounded-lg">
                      Bench Sub
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
