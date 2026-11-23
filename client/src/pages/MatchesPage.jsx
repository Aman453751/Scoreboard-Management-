import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { tournamentService } from '../services/tournamentService';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Radio,
  Edit2,
  Trash2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LiveBadge from '../components/common/LiveBadge';
import { formatDateTime, getStatusBadgeClass, getSportBadgeClass } from '../utils/formatters';

const MatchesPage = () => {
  const { isAdmin, isScorer, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [scorers, setScorers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sportFilter, setSportFilter] = useState('ALL');
  const [tournamentFilter, setTournamentFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    tournamentId: '',
    teamAId: '',
    teamBId: '',
    sportType: 'CRICKET',
    matchDate: '',
    venue: '',
    scorerId: '',
    status: 'UPCOMING'
  });

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });

  const fetchMatches = async () => {
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (sportFilter !== 'ALL') params.sportType = sportFilter;
      if (tournamentFilter !== 'ALL') params.tournamentId = tournamentFilter;
      if (search) params.search = search;

      const res = await matchService.getAll(params);
      if (res.success) setMatches(res.data.matches || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [tourRes, teamRes, scorerRes] = await Promise.all([
        tournamentService.getAll(),
        teamService.getAll(),
        userService.getScorers()
      ]);
      if (tourRes.success) setTournaments(tourRes.data.tournaments || []);
      if (teamRes.success) setTeams(teamRes.data.teams || []);
      if (scorerRes.success) setScorers(scorerRes.data.scorers || []);
    } catch (err) {
      console.warn('Dependency load error:', err);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [statusFilter, sportFilter, tournamentFilter, search]);

  useEffect(() => {
    if (searchParams.get('action') === 'new' && isAdmin) {
      const tourId = searchParams.get('tournamentId');
      openCreateModal(tourId);
    }
  }, [searchParams, isAdmin]);

  const openCreateModal = (preselectedTourId = '') => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      tournamentId: preselectedTourId || (tournaments[0]?.id ? String(tournaments[0].id) : ''),
      teamAId: teams[0]?.id ? String(teams[0].id) : '',
      teamBId: teams[1]?.id ? String(teams[1].id) : '',
      sportType: 'CRICKET',
      matchDate: new Date().toISOString().slice(0, 16),
      venue: 'Main Sports Complex',
      scorerId: '',
      status: 'UPCOMING'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (m) => {
    setIsEditing(true);
    setCurrentId(m.id);
    setFormData({
      tournamentId: String(m.tournamentId),
      teamAId: String(m.teamAId),
      teamBId: String(m.teamBId),
      sportType: m.sportType,
      matchDate: new Date(m.matchDate).toISOString().slice(0, 16),
      venue: m.venue,
      scorerId: m.scorerId ? String(m.scorerId) : '',
      status: m.status
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.teamAId === formData.teamBId) {
      setFormError('A team cannot play against itself. Please choose two distinct teams.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (isEditing) {
        await matchService.update(currentId, formData);
      } else {
        await matchService.create(formData);
      }
      setIsModalOpen(false);
      fetchMatches();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await matchService.delete(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchMatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete match.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-cyan-500" />
            <span>Match Schedule & Fixtures</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tournament schedules, match venues, official scorers, and live statuses
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Match</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-navy-900 p-4 rounded-2xl border border-slate-800">
        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venue or teams..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="LIVE">Live</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Sport:</span>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Sports</option>
              <option value="CRICKET">Cricket</option>
              <option value="FOOTBALL">Football</option>
              <option value="BASKETBALL">Basketball</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Tournament:</span>
            <select
              value={tournamentFilter}
              onChange={(e) => setTournamentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none max-w-[160px] truncate"
            >
              <option value="ALL">All Tournaments</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading fixtures...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 rounded-3xl bg-navy-900 border border-slate-800 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No matches found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or schedule a new match.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl bg-navy-900 border transition-all flex flex-col justify-between shadow-lg ${
                m.status === 'LIVE' ? 'border-blue-500/50 bg-gradient-to-br from-navy-900 to-blue-950/20' : 'border-slate-800'
              }`}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                  <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${getSportBadgeClass(m.sportType)}`}>
                    {m.sportType}
                  </span>
                  <div className="flex items-center gap-2">
                    {m.status === 'LIVE' ? (
                      <LiveBadge />
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusBadgeClass(m.status)}`}>
                        {m.status}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 truncate">{m.tournament?.name}</p>

                {/* Team Matchup Cards */}
                <div className="space-y-3 py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={m.teamA.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.teamA.name}`}
                        alt={m.teamA.name}
                        className="w-7 h-7 rounded-lg bg-slate-800 p-0.5 border border-slate-700 object-cover"
                      />
                      <span className="text-sm font-bold text-white truncate max-w-[150px]">{m.teamA.name}</span>
                    </div>
                    <span className="text-base font-black text-white font-mono">
                      {m.sportType === 'CRICKET' && m.score
                        ? `${m.score.teamARuns}/${m.score.teamAWickets}`
                        : m.sportType === 'FOOTBALL' && m.score
                        ? m.score.teamAGoals
                        : m.sportType === 'BASKETBALL' && m.score
                        ? m.score.teamAPoints
                        : '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={m.teamB.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.teamB.name}`}
                        alt={m.teamB.name}
                        className="w-7 h-7 rounded-lg bg-slate-800 p-0.5 border border-slate-700 object-cover"
                      />
                      <span className="text-sm font-bold text-white truncate max-w-[150px]">{m.teamB.name}</span>
                    </div>
                    <span className="text-base font-black text-white font-mono">
                      {m.sportType === 'CRICKET' && m.score
                        ? `${m.score.teamBRuns}/${m.score.teamBWickets}`
                        : m.sportType === 'FOOTBALL' && m.score
                        ? m.score.teamBGoals
                        : m.sportType === 'BASKETBALL' && m.score
                        ? m.score.teamBPoints
                        : '-'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{formatDateTime(m.matchDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{m.venue}</span>
                  </div>
                  {m.scorer && (
                    <div className="text-[11px] text-slate-500">
                      Scorer: <strong className="text-slate-400 font-normal">{m.scorer.name}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-6 py-3.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/scoreboard/${m.id}`}
                    className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>{m.status === 'LIVE' ? 'Watch Live' : 'Match Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {(isAdmin || (isScorer && m.scorerId === user?.id)) && (
                    <Link
                      to={`/scoreboard/${m.id}?mode=scorer`}
                      className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 text-[10px] font-semibold hover:bg-blue-600/30"
                    >
                      Score
                    </Link>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, id: m.id, name: `${m.teamA.name} vs ${m.teamB.name}` })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule / Edit Match Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Match Schedule' : 'Schedule Match'}
      >
        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tournament</label>
            <select
              required
              value={formData.tournamentId}
              onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select Tournament --</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.sportType})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Team A (Home)</label>
              <select
                required
                value={formData.teamAId}
                onChange={(e) => setFormData({ ...formData, teamAId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Choose Team A --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Team B (Away)</label>
              <select
                required
                value={formData.teamBId}
                onChange={(e) => setFormData({ ...formData, teamBId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Choose Team B --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sport Type</label>
              <select
                value={formData.sportType}
                onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CRICKET">Cricket</option>
                <option value="FOOTBALL">Football</option>
                <option value="BASKETBALL">Basketball</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Match Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.matchDate}
                onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Venue / Stadium</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g., Main Pitch"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assign Official Scorer (Optional)</label>
            <select
              value={formData.scorerId}
              onChange={(e) => setFormData({ ...formData, scorerId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- No specific scorer assigned --</option>
              {scorers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : isEditing ? 'Update Match' : 'Schedule Match'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Match"
        message={`Are you sure you want to delete ${deleteDialog.name}? Scores and events recorded for this match will also be deleted.`}
      />
    </div>
  );
};

export default MatchesPage;
