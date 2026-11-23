import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Shield,
  Building,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Trophy,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate } from '../utils/formatters';

const TeamDetailPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Player Modal
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [playerFormLoading, setPlayerFormLoading] = useState(false);
  const [playerFormError, setPlayerFormError] = useState('');
  const [playerFormData, setPlayerFormData] = useState({
    name: '',
    jerseyNumber: '',
    role: '',
    isCaptain: false
  });

  const [deletePlayerDialog, setDeletePlayerDialog] = useState({ isOpen: false, id: null, name: '' });

  const fetchTeam = async () => {
    try {
      const res = await teamService.getById(id);
      if (res.success) {
        setTeam(res.data.team);
      }
    } catch (err) {
      console.error('Error fetching team details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const openAddPlayerModal = () => {
    setEditingPlayerId(null);
    setPlayerFormData({
      name: '',
      jerseyNumber: '',
      role: '',
      isCaptain: false
    });
    setPlayerFormError('');
    setIsPlayerModalOpen(true);
  };

  const openEditPlayerModal = (p) => {
    setEditingPlayerId(p.id);
    setPlayerFormData({
      name: p.name,
      jerseyNumber: p.jerseyNumber || '',
      role: p.role || '',
      isCaptain: Boolean(p.isCaptain)
    });
    setPlayerFormError('');
    setIsPlayerModalOpen(true);
  };

  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    setPlayerFormLoading(true);
    setPlayerFormError('');

    try {
      if (editingPlayerId) {
        await teamService.updatePlayer(editingPlayerId, playerFormData);
      } else {
        await teamService.addPlayer(id, playerFormData);
      }
      setIsPlayerModalOpen(false);
      fetchTeam();
    } catch (err) {
      setPlayerFormError(err.response?.data?.message || 'Player operation failed.');
    } finally {
      setPlayerFormLoading(false);
    }
  };

  const handleDeletePlayer = async () => {
    try {
      await teamService.deletePlayer(deletePlayerDialog.id);
      setDeletePlayerDialog({ isOpen: false, id: null, name: '' });
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete player.');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-xs">Loading team profile...</div>;
  }

  if (!team) {
    return <div className="text-center py-20 text-slate-400 text-sm">Team not found.</div>;
  }

  const allMatches = [
    ...(team.matchesAsTeamA || []).map((m) => ({ ...m, role: 'Team A', opponent: m.teamB })),
    ...(team.matchesAsTeamB || []).map((m) => ({ ...m, role: 'Team B', opponent: m.teamA }))
  ].sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));

  return (
    <div className="space-y-8">
      {/* Team Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-indigo-950/40 border border-slate-700/80 p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={team.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${team.name}`}
              alt={team.name}
              className="w-20 h-20 rounded-2xl bg-slate-800 p-1.5 border border-slate-700 object-cover shadow-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{team.name}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {team.shortName || team.name.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {team.college} {team.department ? `• ${team.department}` : ''}
              </p>
              {team.captainName && (
                <div className="flex items-center gap-1.5 pt-1 text-xs text-amber-400 font-semibold">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Captain: {team.captainName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/teams"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              All Teams
            </Link>
          </div>
        </div>
      </div>

      {/* Roster & Squad Table */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Active Squad Roster ({team.players?.length || 0})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Player lineup, jersey numbers, and designated roles</p>
          </div>

          {isAdmin && (
            <button
              onClick={openAddPlayerModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Player</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Player Name</th>
                <th className="py-3 px-4">Role / Position</th>
                <th className="py-3 px-4 text-center">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
              {team.players?.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-slate-500 italic">
                    No players registered in this team yet.
                  </td>
                </tr>
              ) : (
                team.players.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {p.jerseyNumber ? `#${p.jerseyNumber}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.isCaptain && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          CAPTAIN
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{p.role || 'Player'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditPlayerModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletePlayerDialog({ isOpen: true, id: p.id, name: p.name })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match History For This Team */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 space-y-4 shadow-lg">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Match Schedule & Performance History ({allMatches.length})</span>
        </h3>

        {allMatches.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No matches scheduled for this team.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allMatches.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">{m.sportType}</span>
                  <h4 className="font-bold text-white mt-0.5">
                    vs {m.opponent?.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(m.matchDate)} • {m.venue}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    m.status === 'LIVE' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {m.status}
                  </span>
                  <Link
                    to={`/scoreboard/${m.id}`}
                    className="p-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Player Modal */}
      <Modal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        title={editingPlayerId ? 'Edit Player' : 'Add Player to Roster'}
      >
        {playerFormError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{playerFormError}</span>
          </div>
        )}

        <form onSubmit={handlePlayerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Player Full Name</label>
            <input
              type="text"
              required
              value={playerFormData.name}
              onChange={(e) => setPlayerFormData({ ...playerFormData, name: e.target.value })}
              placeholder="e.g., Arjun Verma"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Jersey Number</label>
              <input
                type="number"
                min="0"
                max="999"
                value={playerFormData.jerseyNumber}
                onChange={(e) => setPlayerFormData({ ...playerFormData, jerseyNumber: e.target.value })}
                placeholder="18"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role / Position</label>
              <input
                type="text"
                value={playerFormData.role}
                onChange={(e) => setPlayerFormData({ ...playerFormData, role: e.target.value })}
                placeholder="e.g., All-Rounder / Forward / Point Guard"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCaptainCheck"
              checked={playerFormData.isCaptain}
              onChange={(e) => setPlayerFormData({ ...playerFormData, isCaptain: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <label htmlFor="isCaptainCheck" className="text-xs text-slate-300 font-medium">
              Assign as Team Captain
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPlayerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={playerFormLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 disabled:opacity-50"
            >
              {playerFormLoading ? 'Saving...' : editingPlayerId ? 'Update Player' : 'Add Player'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Player Dialog */}
      <ConfirmDialog
        isOpen={deletePlayerDialog.isOpen}
        onClose={() => setDeletePlayerDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDeletePlayer}
        title="Remove Player"
        message={`Are you sure you want to remove ${deletePlayerDialog.name} from ${team.name}'s roster?`}
      />
    </div>
  );
};

export default TeamDetailPage;
