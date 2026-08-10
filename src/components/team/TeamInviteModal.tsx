import React, { useState } from 'react';
import { Team, TeamRole, TeamMember } from '../../types';
import { X, UserPlus, Copy, Check, Shield, Users, Mail, Key } from 'lucide-react';

interface TeamInviteModalProps {
  team: Team;
  currentUserId?: string;
  onClose: () => void;
}

export const TeamInviteModal: React.FC<TeamInviteModalProps> = ({ team, currentUserId, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<TeamRole>('parent');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const inviteCode = team.inviteCode || 'STRIKE-7890';
  const members = team.members || [];

  const rolesList: Array<{ role: TeamRole; title: string; desc: string }> = [
    { role: 'coach', title: 'Head Coach', desc: 'Full administrative control, team settings, roster & tactics management' },
    { role: 'assistant_coach', title: 'Assistant Coach', desc: 'Roster, lineup, tactics, sub schedules, and drill editing rights' },
    { role: 'manager', title: 'Manager', desc: 'Match schedule, logistics, roster management, and player attendance' },
    { role: 'communications', title: 'Communications', desc: 'Team announcements, parent notifications, messaging' },
    { role: 'parent', title: 'Parent / Player', desc: 'Read-only access to roster, equal-minutes match schedule, tactics, and drills' }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/?join=${inviteCode}&role=${selectedRole}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Invite Members to {team.name}
              </h2>
              <p className="text-xs text-slate-400">Share 6-character code or link to assign specific team roles</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Team 6-Character Invite Code Card */}
          <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-2xl p-4 space-y-3 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" /> Team Invite Code:
              </span>
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full border border-cyan-500/30 font-bold">
                Active Code
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-2xl font-black text-white tracking-widest font-mono">{inviteCode}</span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-cyan-500/20"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Select Target Invite Role */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" /> Pick Role for Invited Member:
            </label>

            <div className="grid grid-cols-1 gap-2">
              {rolesList.map(item => {
                const isSelected = selectedRole === item.role;
                return (
                  <div
                    key={item.role}
                    onClick={() => setSelectedRole(item.role)}
                    className={`p-3 rounded-2xl cursor-pointer transition border flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{item.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition border border-slate-700 active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedLink ? 'Invite Link Copied!' : `Copy Invite Link as ${rolesList.find(r => r.role === selectedRole)?.title}`}</span>
            </button>
          </div>

          {/* Current Roster Members */}
          {members.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" /> Active Team Roster ({members.length})
                </span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {members.map(m => (
                  <div key={m.uid} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{m.displayName}</div>
                      <div className="text-[10px] text-slate-400">{m.email}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold rounded-md border border-cyan-500/30 capitalize">
                      {m.role.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
