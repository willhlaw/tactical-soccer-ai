import React, { useState } from 'react';
import { Team, Player, PlayingStyle, PositionRole } from '../../types';
import { UserPlus, Settings, Sparkles, Edit3, Trash2, Check, X, ChevronRight } from 'lucide-react';
import { PHILOSOPHY_KNOWLEDGE } from '../../services/coachingKnowledge';

interface RosterViewProps {
  team: Team;
  onUpdateTeam: (updatedTeam: Team) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({ team, onUpdateTeam }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isEditingStyle, setIsEditingStyle] = useState(false);

  const handlePlayingStyleChange = (style: PlayingStyle) => {
    onUpdateTeam({
      ...team,
      playingStyle: style
    });
  };

  const handleSavePlayer = (updatedPlayer: Player) => {
    const roster = team.roster.some(p => p.id === updatedPlayer.id)
      ? team.roster.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
      : [...team.roster, updatedPlayer];

    onUpdateTeam({
      ...team,
      roster
    });
    setSelectedPlayer(null);
  };

  const handleDeletePlayer = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this player from the roster?')) {
      onUpdateTeam({
        ...team,
        roster: team.roster.filter(p => p.id !== id)
      });
    }
  };

  const handleAddNewPlayer = () => {
    const newP: Player = {
      id: 'player-' + Date.now(),
      name: 'New Player',
      number: team.roster.length + 1,
      isAbsent: false,
      preferredPositions: ['CM', 'ST'],
      attributes: { speed: 7, dribbling: 7, passing: 7, stamina: 7, defending: 7 },
      avatarColor: '#10b981',
      notes: ''
    };
    setSelectedPlayer(newP);
  };

  const activeStyleDetail = PHILOSOPHY_KNOWLEDGE[team.playingStyle] || PHILOSOPHY_KNOWLEDGE['youth-buildout'];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Team & Playing Style Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-amber-500">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-black text-white">{team.name} Roster</h2>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-bold border border-emerald-500/30">
              {team.format} ({team.ageGroup})
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Active Tactical Style: <strong className="text-amber-300">{activeStyleDetail.name}</strong> — {activeStyleDetail.tagline}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setIsEditingStyle(!isEditingStyle)}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-2xl text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2 shadow-md"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Tactical Style</span>
          </button>
          <button
            onClick={handleAddNewPlayer}
            className="flex-1 sm:flex-none min-h-[44px] px-5 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Player</span>
          </button>
        </div>
      </div>

      {/* Playing Style Selector Modal / Drawer */}
      {isEditingStyle && (
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-amber-500/30">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Select Team Playing Style (AI Tactical Persona)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(PHILOSOPHY_KNOWLEDGE) as PlayingStyle[]).map(styleKey => {
              const detail = PHILOSOPHY_KNOWLEDGE[styleKey];
              const isSelected = team.playingStyle === styleKey;
              return (
                <div
                  key={styleKey}
                  onClick={() => handlePlayingStyleChange(styleKey)}
                  className={`p-4 rounded-2xl border cursor-pointer min-h-[54px] transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{detail.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="text-[11px] text-amber-300 mt-1 font-medium">{detail.tagline}</div>
                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{detail.buildUpStrategy}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Touch-Optimized Roster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.roster.map(player => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className="glass-card p-5 rounded-3xl space-y-4 relative group border border-slate-800 hover:border-emerald-500/40 active:scale-[0.98] transition cursor-pointer shadow-lg hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div
                  style={{ backgroundColor: player.avatarColor || '#10b981' }}
                  className="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center font-black text-white text-base shadow-xl ring-4 ring-black/20"
                >
                  #{player.number}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {player.name}
                  </h4>
                  <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                    {player.preferredPositions.join(' • ')}
                  </div>
                </div>
              </div>

              {/* Large Touch Edit Pill */}
              <div className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800/80 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* Attributes Touch Ratings */}
            <div className="grid grid-cols-5 gap-2 text-xs pt-3 border-t border-slate-800/80">
              <div className="text-center bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/50">
                <div className="text-[10px] text-slate-400 font-semibold">SPD</div>
                <div className="font-black text-emerald-400 text-sm">{player.attributes.speed}</div>
              </div>
              <div className="text-center bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/50">
                <div className="text-[10px] text-slate-400 font-semibold">DRI</div>
                <div className="font-black text-blue-400 text-sm">{player.attributes.dribbling}</div>
              </div>
              <div className="text-center bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/50">
                <div className="text-[10px] text-slate-400 font-semibold">PAS</div>
                <div className="font-black text-indigo-400 text-sm">{player.attributes.passing}</div>
              </div>
              <div className="text-center bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/50">
                <div className="text-[10px] text-slate-400 font-semibold">STA</div>
                <div className="font-black text-amber-400 text-sm">{player.attributes.stamina}</div>
              </div>
              <div className="text-center bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/50">
                <div className="text-[10px] text-slate-400 font-semibold">DEF</div>
                <div className="font-black text-red-400 text-sm">{player.attributes.defending}</div>
              </div>
            </div>

            {player.notes && (
              <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 line-clamp-2">
                &ldquo;{player.notes}&rdquo;
              </p>
            )}

            {/* Action Bar inside Card */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-semibold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" /> Tap to Edit Profile
              </span>
              <button
                onClick={(e) => handleDeletePlayer(e, player.id)}
                className="min-h-[36px] min-w-[36px] p-2 bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition flex items-center justify-center"
                title="Delete Player"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Player Modal */}
      {selectedPlayer && (
        <PlayerEditModal
          player={selectedPlayer}
          onSave={handleSavePlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};

interface PlayerEditModalProps {
  player: Player;
  onSave: (p: Player) => void;
  onClose: () => void;
}

const PlayerEditModal: React.FC<PlayerEditModalProps> = ({ player, onSave, onClose }) => {
  const [formData, setFormData] = useState<Player>({ ...player });
  const ALL_POSITIONS: PositionRole[] = ['GK', 'CB', 'LB', 'RB', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'ST', 'FW'];

  const togglePosition = (pos: PositionRole) => {
    const exists = formData.preferredPositions.includes(pos);
    const updated = exists
      ? formData.preferredPositions.filter(p => p !== pos)
      : [...formData.preferredPositions, pos];
    setFormData({ ...formData, preferredPositions: updated });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-xl p-6 rounded-3xl space-y-5 border border-slate-700 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              style={{ backgroundColor: formData.avatarColor || '#10b981' }}
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
            >
              #{formData.number}
            </div>
            <h3 className="text-lg font-black text-white">Edit Player Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] rounded-2xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-slate-300 font-bold text-xs">Player Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1.5 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold text-xs">Jersey #:</label>
              <input
                type="number"
                min="1"
                max="99"
                value={formData.number ? Number(formData.number) : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFormData({ ...formData, number: isNaN(val) ? 0 : val });
                }}
                className="w-full mt-1.5 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Touch-Friendly Preferred Positions */}
          <div>
            <label className="text-slate-300 font-bold text-xs">Preferred Positions (Tap to select in priority order):</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_POSITIONS.map(pos => {
                const isSelected = formData.preferredPositions.includes(pos);
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    className={`min-h-[44px] min-w-[50px] px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big Touch Attribute Sliders */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="text-slate-300 font-bold text-xs">Player Strengths &amp; Attributes (1-10):</div>
            {(['speed', 'dribbling', 'passing', 'stamina', 'defending'] as const).map(attr => (
              <div key={attr} className="flex items-center justify-between space-x-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
                <span className="capitalize font-bold text-slate-200 text-xs w-24">{attr}:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.attributes[attr]}
                  onChange={(e) => setFormData({
                    ...formData,
                    attributes: { ...formData.attributes, [attr]: Number(e.target.value) }
                  })}
                  className="w-full h-3 accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="font-black text-emerald-400 text-sm w-6 text-right">{formData.attributes[attr]}</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-300 font-bold text-xs">Player Notes &amp; Preferred Roles:</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="e.g. Preferred Goalie 1st Half, Forward 2nd Half. Fast sprinter."
              className="w-full mt-1.5 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="min-h-[48px] px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="min-h-[48px] px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg shadow-emerald-500/20"
          >
            Save Player Profile
          </button>
        </div>
      </div>
    </div>
  );
};
