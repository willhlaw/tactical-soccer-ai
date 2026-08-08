import React, { useState } from 'react';
import { Team, Player, GameMode, MatchSubShift, FormationPreset } from '../../types';
import { generateMatchSubPlan } from '../../services/lineupGenerator';
import { FORMATION_PRESETS } from '../../services/formations';
import { Users, Clock, Shield, Sparkles, CheckCircle, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

interface GameDayManagerProps {
  team: Team;
  onUpdateRoster: (roster: Player[]) => void;
}

export const GameDayManager: React.FC<GameDayManagerProps> = ({ team, onUpdateRoster }) => {
  const [gameMode, setGameMode] = useState<GameMode>('recreation');
  const [matchDuration, setMatchDuration] = useState<number>(40);
  const [subInterval, setSubInterval] = useState<number>(8);
  const [shifts, setShifts] = useState<MatchSubShift[]>([]);
  const [activeShiftIndex, setActiveShiftIndex] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  const activeFormation = FORMATION_PRESETS.find(f => f.format === team.format) || FORMATION_PRESETS[2];

  const handleToggleAbsence = (playerId: string) => {
    const updated = team.roster.map(p => p.id === playerId ? { ...p, isAbsent: !p.isAbsent } : p);
    onUpdateRoster(updated);
  };

  const handleGenerateSubPlan = () => {
    const generated = generateMatchSubPlan({
      roster: team.roster,
      formation: activeFormation,
      gameMode: gameMode,
      totalDurationMinutes: matchDuration,
      subIntervalMinutes: subInterval,
      playingStyle: team.playingStyle
    });
    setShifts(generated);
    setActiveShiftIndex(0);
  };

  // Timer effect
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const currentShift = shifts[activeShiftIndex];
  const absentCount = team.roster.filter(p => p.isAbsent).length;
  const presentCount = team.roster.length - absentCount;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            Game Day & Live Sub Engine ({team.name})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage player absences, select Rec (Fair Play) or Competitive Mode, and run live substitution timing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setGameMode('recreation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              gameMode === 'recreation'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Recreation (Fair Play)
          </button>
          <button
            onClick={() => setGameMode('competitive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              gameMode === 'competitive'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Competitive (ADP/Travel)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attendance & Setup */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Game Day Attendance
            </h3>
            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
              {presentCount} Present / {absentCount} Absent
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Tap a player to mark as absent or injured for today&apos;s match:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {team.roster.map(player => (
              <div
                key={player.id}
                onClick={() => handleToggleAbsence(player.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  player.isAbsent
                    ? 'bg-red-950/40 border-red-800/60 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    style={{ backgroundColor: player.avatarColor || '#10b981' }}
                    className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-bold text-white text-xs"
                  >
                    #{player.number}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{player.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Pref: {player.preferredPositions.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  {player.isAbsent ? (
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Absent
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sub Engine Settings */}
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Match Duration:</span>
              <select
                value={matchDuration}
                onChange={(e) => setMatchDuration(Number(e.target.value))}
                className="bg-slate-950 text-white px-2 py-1 rounded border border-slate-700"
              >
                <option value={30}>30 Mins (5v5)</option>
                <option value={40}>40 Mins (7v7)</option>
                <option value={50}>50 Mins (9v9)</option>
                <option value={60}>60 Mins (11v11)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Sub Shift Interval:</span>
              <select
                value={subInterval}
                onChange={(e) => setSubInterval(Number(e.target.value))}
                className="bg-slate-950 text-white px-2 py-1 rounded border border-slate-700"
              >
                <option value={5}>Every 5 Mins</option>
                <option value={8}>Every 8 Mins</option>
                <option value={10}>Every 10 Mins</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateSubPlan}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Lineup & Sub Matrix
          </button>
        </div>

        {/* Right 2 Columns: Live Match Tracker & Sub Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Match Clock Banner */}
          <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-emerald-500">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Match Clock</div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                  isTimerRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isTimerRunning ? 'Pause Clock' : 'Start Clock'}
              </button>
              <button
                onClick={() => { setTimerSeconds(0); setIsTimerRunning(false); }}
                className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub Shifts Timeline Viewer */}
          {shifts.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Substitution Shift Schedule ({shifts.length} total shifts)
                </h3>
                <span className="text-xs text-amber-400 font-semibold">
                  Shift {activeShiftIndex + 1} of {shifts.length} (Min {currentShift?.minute}&apos;)
                </span>
              </div>

              {/* Shift Buttons Selector */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {shifts.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveShiftIndex(i)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                      activeShiftIndex === i
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Shift {i + 1} ({s.minute}&apos;)
                  </button>
                ))}
              </div>

              {/* Current Active Shift Layout */}
              {currentShift && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* On Field Players */}
                  <div className="glass-card p-4 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center justify-between">
                      <span>On Field ({currentShift.fieldLineup.length})</span>
                      <span className="text-[10px] text-slate-400">Period {currentShift.period}</span>
                    </div>

                    <div className="space-y-2">
                      {currentShift.fieldLineup.map((item, idx) => {
                        const p = team.roster.find(player => player.id === item.playerId);
                        return (
                          <div key={idx} className="p-2 bg-slate-900/90 rounded-lg border border-emerald-500/20 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">{item.role}:</span>
                            <span className="text-emerald-400 font-semibold">
                              {p ? `#${p.number} ${p.name}` : 'Unknown'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bench Players */}
                  <div className="glass-card p-4 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      Bench ({currentShift.benchPlayerIds.length})
                    </div>

                    <div className="space-y-2">
                      {currentShift.benchPlayerIds.length > 0 ? (
                        currentShift.benchPlayerIds.map(id => {
                          const p = team.roster.find(player => player.id === id);
                          return (
                            <div key={id} className="p-2 bg-slate-900/90 rounded-lg border border-amber-500/20 flex items-center justify-between text-xs">
                              <span className="text-slate-400">Bench Sub:</span>
                              <span className="text-amber-300 font-medium">
                                {p ? `#${p.number} ${p.name}` : 'Unknown'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-slate-500 italic p-2">No players on bench</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">No Substitution Schedule Generated Yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Check off any absent players on the left, select Recreation (Fair Play) or Competitive mode, then click &quot;Generate Lineup &amp; Sub Matrix&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
