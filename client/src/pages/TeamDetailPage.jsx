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
  ArrowLeft,
  AlertCircle,
  User,
  Mail
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
      await teamService.removePlayer(deletePlayerDialog.id);
      setDeletePlayerDialog({ isOpen: false, id: null, name: '' });
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove player.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xs font-mono text-[#8c909f]">
        Loading department roster...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-20 text-sm text-[#8c909f]">
        <p>Team roster not found.</p>
        <Link to="/teams" className="mt-4 inline-block text-[#4cd7f6] font-semibold">
          ← Back to Teams
        </Link>
      </div>
    );
  }

  // Combine matches as team1 and team2
  const teamMatches = [...(team.matchesAsTeam1 || []), ...(team.matchesAsTeam2 || [])];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8c909f] hover:text-[#dee2f4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Teams</span>
        </Link>
      </div>

      {/* Team Header Card */}
      <div className="rounded-xl bg-[#161b28] border border-[#252a37] p-5 sm:p-7 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-xl shadow">
              {team.shortName || team.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {team.name}
                </h1>
                {team.shortName && (
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase">
                    {team.shortName}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8c909f] mt-0.5">
                {team.department ? `Department of ${team.department}` : team.college}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={openAddPlayerModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Squad Member</span>
            </button>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#252a37] text-xs text-[#c2c6d6]">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#4cd7f6]" />
            <span>{team.college}</span>
          </div>
          {team.captainName && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#4edea3]" />
              <span>Captain: <strong className="text-white">{team.captainName}</strong></span>
            </div>
          )}
          {team.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#adc6ff]" />
              <span className="truncate">{team.contactEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Roster & Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player Squad Roster */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4cd7f6]" />
              <span>Active Squad Roster ({team.players?.length || 0})</span>
            </h2>
          </div>

          {(!team.players || team.players.length === 0) ? (
            <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-8 text-center text-xs text-[#8c909f]">
              No players currently registered in this team squad.
            </div>
          ) : (
            <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090e1a] text-[#8c909f] uppercase font-label-sm text-[11px] tracking-wider border-b border-[#252a37]">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Player Name</th>
                    <th className="py-2.5 px-3">Role / Pos</th>
                    {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252a37]">
                  {team.players.map((p) => (
                    <tr key={p.id} className="hover:bg-[#161b28]">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#4cd7f6]">
                        {p.jerseyNumber || '-'}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{p.name}</span>
                          {p.isCaptain && (
                            <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              CAPTAIN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#c2c6d6] text-[11px]">
                        {p.role || 'Player'}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEditPlayerModal(p)}
                              className="p-1 rounded hover:bg-[#252a37] text-[#8c909f] hover:text-white"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletePlayerDialog({ isOpen: true, id: p.id, name: p.name })}
                              className="p-1 rounded hover:bg-red-500/10 text-[#8c909f] hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Fixtures / Matches */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4edea3]" />
              <span>Fixtures & History ({teamMatches.length})</span>
            </h2>
          </div>

          {teamMatches.length === 0 ? (
            <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-8 text-center text-xs text-[#8c909f]">
              No matches recorded for this team yet.
            </div>
          ) : (
            <div className="space-y-3">
              {teamMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#1a1f2c] border border-[#252a37] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#4cd7f6] uppercase font-bold">{m.sportType}</span>
                    <span className="text-[#8c909f]">{formatDate(m.matchDate)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>{m.team1?.name || m.teamA?.name}</span>
                    <span className="text-[#8c909f] font-normal text-[11px]">vs</span>
                    <span>{m.team2?.name || m.teamB?.name}</span>
                  </div>
                  <div className="pt-2 border-t border-[#252a37] flex items-center justify-between">
                    <span className="text-[11px] text-[#8c909f]">{m.status}</span>
                    <Link to={`/scoreboard/${m.id}`} className="text-[#4cd7f6] hover:underline font-semibold">
                      Match Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player Modal */}
      <Modal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        title={editingPlayerId ? 'Edit Player' : 'Add Player to Squad'}
      >
        <form onSubmit={handlePlayerSubmit} className="space-y-4">
          {playerFormError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{playerFormError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Player Full Name *</label>
            <input
              type="text"
              required
              value={playerFormData.name}
              onChange={(e) => setPlayerFormData({ ...playerFormData, name: e.target.value })}
              placeholder="e.g. Jordan Miller"
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Jersey Number</label>
              <input
                type="number"
                value={playerFormData.jerseyNumber}
                onChange={(e) => setPlayerFormData({ ...playerFormData, jerseyNumber: e.target.value })}
                placeholder="e.g. 10"
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Position / Role</label>
              <input
                type="text"
                value={playerFormData.role}
                onChange={(e) => setPlayerFormData({ ...playerFormData, role: e.target.value })}
                placeholder="e.g. Forward / All-Rounder"
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCaptain"
              checked={playerFormData.isCaptain}
              onChange={(e) => setPlayerFormData({ ...playerFormData, isCaptain: e.target.checked })}
              className="w-4 h-4 rounded bg-[#090e1a] border-[#252a37] text-[#4d8eff] focus:ring-0"
            />
            <label htmlFor="isCaptain" className="text-xs text-[#dee2f4] font-semibold cursor-pointer">
              Designate as Team Captain
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252a37]">
            <button
              type="button"
              onClick={() => setIsPlayerModalOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-semibold text-[#c2c6d6] hover:bg-[#252a37]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={playerFormLoading}
              className="px-4 py-1.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs"
            >
              {playerFormLoading ? 'Saving...' : editingPlayerId ? 'Save Changes' : 'Add Player'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Player Dialog */}
      <ConfirmDialog
        isOpen={deletePlayerDialog.isOpen}
        title="Remove Player"
        message={`Are you sure you want to remove ${deletePlayerDialog.name} from the squad?`}
        confirmText="Remove Player"
        confirmVariant="danger"
        onConfirm={handleDeletePlayer}
        onCancel={() => setDeletePlayerDialog({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default TeamDetailPage;
