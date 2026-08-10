import React, { useState } from 'react';
import { Team, TeamRole } from '../../types';
import { Shield, ChevronDown, Plus, Key, Users, Check, UserPlus } from 'lucide-react';

interface TeamSwitcherProps {
  teams: Team[];
  activeTeam: Team;
  userRole?: TeamRole;
  onSelectTeam: (teamId: string) => void;
  onCreateTeam: () => void;
  onOpenInviteModal: () => void;
  onOpenJoinModal: () => void;
}

export const TeamSwitcher: React.FC<TeamSwitcherProps> = ({
  teams,
  activeTeam,
  userRole = 'coach',
  onSelectTeam,
  onCreateTeam,
  onOpenInviteModal,
  onOpenJoinModal
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const roleLabels: Record<TeamRole, { label: string; color: string }> = {
    coach: { label: 'Head Coach', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    assistant_coach: { label: 'Assistant Coach', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    manager: { label: 'Manager', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    communications: { label: 'Communications', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    parent: { label: 'Parent / Viewer', color: 'bg-slate-800 text-slate-300 border-slate-700' }
  };

  const currentRoleStyle = roleLabels[userRole] || roleLabels.coach;

  return (
    <div className="relative select-none">
      {/* Active Team Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-2xl border border-slate-800 transition active:scale-95 shadow-md"
      >
        <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-xs font-black text-white flex items-center gap-1.5">
            <span className="line-clamp-1">{activeTeam.name}</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded border ${currentRoleStyle.color} font-bold`}>
              {currentRoleStyle.label}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {activeTeam.format} • {activeTeam.roster.length} Players
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Team Selection Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-2xl z-[999] space-y-2 animate-fadeIn">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
            Your Teams ({teams.length})
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {teams.map(t => {
              const isSelected = t.id === activeTeam.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTeam(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition border ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-bold'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800/80'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {t.format} ({t.ageGroup}) • {t.roster.length} players
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <button
              onClick={() => {
                onCreateTeam();
                setIsOpen(false);
              }}
              className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Team</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onOpenInviteModal();
                  setIsOpen(false);
                }}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition border border-slate-700"
              >
                <UserPlus className="w-3 h-3 text-cyan-400" />
                <span>Invite Team</span>
              </button>

              <button
                onClick={() => {
                  onOpenJoinModal();
                  setIsOpen(false);
                }}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition border border-slate-700"
              >
                <Key className="w-3 h-3 text-amber-400" />
                <span>Join Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
