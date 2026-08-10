import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { joinTeamWithInviteCode } from '../../services/firebase';
import { Team } from '../../types';
import { X, Key, Check, ShieldAlert } from 'lucide-react';

interface JoinTeamModalProps {
  user: User | null;
  onClose: () => void;
  onJoinSuccess: (team: Team) => void;
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({ user, onClose, onJoinSuccess }) => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    if (!user) {
      setErrorMsg('Please sign in or create an account first to join a team.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const joinedTeam = await joinTeamWithInviteCode(inviteCode.trim(), user);
      if (joinedTeam) {
        onJoinSuccess(joinedTeam);
      } else {
        setErrorMsg('Invalid or expired team invite code. Please double-check with your coach.');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to join team. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Join Team with Invite Code
              </h2>
              <p className="text-xs text-slate-400">Enter the 6-character code provided by your head coach</p>
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
        <form onSubmit={handleJoinTeam} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Enter Invite Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. STRIKE-7890"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Joining Team...' : 'Join Team'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
