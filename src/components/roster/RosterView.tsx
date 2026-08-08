import React, { useState } from 'react';
import { Team, Player, PlayingStyle, PositionRole } from '../../types';
import { UserPlus, Settings, Shield, Sparkles, Edit3, Trash2, Check, X } from 'lucide-react';
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

  const handleDeletePlayer = (id: string) => {
    onUpdateTeam({
      ...team,
      roster: team.roster.filter(p => p.id !== id)
    });
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
    <div className="space-y-6">
      {/* Team & Playing Style Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-amber-500">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">{team.name} Roster</h2>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-bold">
              {team.format} ({team.ageGroup})
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Active Playing Style: <strong className="text-amber-300">{activeStyleDetail.name}</strong> — {activeStyleDetail.tagline}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditingStyle(!isEditingStyle)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            Change Playing Style
          </button>
          <button
            onClick={handleAddNewPlayer}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <UserPlus className="w-4 h-4" />
            + Add Player
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
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
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

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.roster.map(player => (
          <div key={player.id} className="glass-card p-4 rounded-2xl space-y-3 relative group border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  style={{ backgroundColor: player.avatarColor || '#10b981' }}
                  className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center font-bold text-white text-sm shadow-md"
                >
                  #{player.number}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{player.name}</h4>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Pref: {player.preferredPositions.join(', ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSelectedPlayer(player)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePlayer(player.id)}
                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Attributes Mini-Bar */}
            <div className="grid grid-cols-5 gap-1.5 text-[10px] pt-1 border-t border-slate-800/80">
              <div className="text-center">
                <div className="text-slate-400">SPD</div>
                <div className="font-bold text-emerald-400">{player.attributes.speed}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">DRI</div>
                <div className="font-bold text-blue-400">{player.attributes.dribbling}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">PAS</div>
                <div className="font-bold text-indigo-400">{player.attributes.passing}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">STA</div>
                <div className="font-bold text-amber-400">{player.attributes.stamina}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-400">DEF</div>
                <div className="font-bold text-red-400">{player.attributes.defending}</div>
              </div>
            </div>

            {player.notes && (
              <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                &ldquo;{player.notes}&rdquo;
              </p>
            )}
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl space-y-4 border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Edit Player Profile</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-slate-400 font-semibold">Player Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold">Jersey #:</label>
              <input
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Preferred Positions */}
          <div>
            <label className="text-slate-400 font-semibold">Preferred Positions (in priority order):</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {ALL_POSITIONS.map(pos => {
                const isSelected = formData.preferredPositions.includes(pos);
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attribute Sliders */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-slate-400 font-semibold">Attributes Rating (1-10):</div>
            {(['speed', 'dribbling', 'passing', 'stamina', 'defending'] as const).map(attr => (
              <div key={attr} className="flex items-center justify-between space-x-3">
                <span className="capitalize text-slate-300 w-20">{attr}:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.attributes[attr]}
                  onChange={(e) => setFormData({
                    ...formData,
                    attributes: { ...formData.attributes, [attr]: Number(e.target.value) }
                  })}
                  className="w-full accent-emerald-500"
                />
                <span className="font-bold text-emerald-400 w-4">{formData.attributes[attr]}</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-400 font-semibold">Player Profile & Style Notes:</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="e.g. Loves playing Goalie and Forward. Fast runner, weak left foot."
              className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold"
          >
            Save Player
          </button>
        </div>
      </div>
    </div>
  );
};
