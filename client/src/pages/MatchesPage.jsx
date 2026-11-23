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
import { formatDateTime } from '../utils/formatters';

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
    team1Id: '',
    team2Id: '',
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
      openCreateModal();
    }
  }, [searchParams, isAdmin]);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      tournamentId: tournaments[0]?.id ? String(tournaments[0].id) : '',
      team1Id: teams[0]?.id ? String(teams[0].id) : '',
      team2Id: teams[1]?.id ? String(teams[1].id) : '',
      sportType: tournaments[0]?.sportType || 'CRICKET',
      matchDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
      venue: 'Main Campus Stadium',
      scorerId: '',
      status: 'UPCOMING'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (m) => {
    setIsEditing(true);
    setCurrentId(m.id);
    const mTeam1 = m.team1Id || m.teamAId || m.team1?.id || m.teamA?.id || '';
    const mTeam2 = m.team2Id || m.teamBId || m.team2?.id || m.teamB?.id || '';

    setFormData({
      tournamentId: String(m.tournamentId),
      team1Id: String(mTeam1),
      team2Id: String(mTeam2),
      sportType: m.sportType,
      matchDate: m.matchDate ? new Date(m.matchDate).toISOString().slice(0, 16) : '',
      venue: m.venue || '',
      scorerId: m.scorerId ? String(m.scorerId) : '',
      status: m.status
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.team1Id === formData.team2Id) {
      setFormError('Team 1 and Team 2 must be different teams.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        ...formData,
        teamAId: formData.team1Id,
        teamBId: formData.team2Id
      };

      if (isEditing) {
        await matchService.update(currentId, payload);
      } else {
        await matchService.create(payload);
      }
      setIsModalOpen(false);
      fetchMatches();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save match.');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#4cd7f6]" />
            <span>Fixtures & Match Schedules</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Complete collegiate fixtures calendar, scheduled rounds, and referee assignments
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Match</span>
          </button>
        )}
      </div>

      {/* Filter and Search Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or venues..."
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-[#dee2f4] placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded px-3 py-2 text-xs text-[#dee2f4] focus:outline-none focus:border-[#4d8eff]"
          >
            <option value="ALL">All Sports</option>
            <option value="CRICKET">Cricket</option>
            <option value="FOOTBALL">Football</option>
            <option value="BASKETBALL">Basketball</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded px-3 py-2 text-xs text-[#dee2f4] focus:outline-none focus:border-[#4d8eff]"
          >
            <option value="ALL">All Statuses</option>
            <option value="LIVE">Live Matches</option>
            <option value="UPCOMING">Upcoming Fixtures</option>
            <option value="COMPLETED">Completed Results</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded px-3 py-2 text-xs text-[#dee2f4] focus:outline-none focus:border-[#4d8eff]"
          >
            <option value="ALL">All Tournaments</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#8c909f]">
          Loading fixtures calendar...
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-[#8c909f] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No matches found</h3>
          <p className="text-xs text-[#8c909f]">
            Try clearing filters or schedule a new fixture.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => {
            const team1 = m.team1 || m.teamA;
            const team2 = m.team2 || m.teamB;

            return (
              <div
                key={m.id}
                className="rounded-xl bg-[#1a1f2c] border border-[#252a37] hover:border-[#4d8eff]/50 p-4 sm:p-5 flex flex-col justify-between shadow-lg transition-all space-y-3.5"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase tracking-wider">
                      {m.sportType}
                    </span>
                    {m.status === 'LIVE' ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-label-sm text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span>LIVE NOW</span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#8c909f] uppercase">
                        {m.status}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#8c909f] truncate font-semibold">
                    {m.tournament?.name || 'Championship Match'}
                  </p>

                  {/* Matchup Banner */}
                  <div className="p-3 rounded-lg bg-[#090e1a] border border-[#1a1f2c] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">{team1?.name}</span>
                      <span className="font-score-display text-sm font-bold text-white font-mono">
                        {m.sportType === 'CRICKET' && (m.cricketScore || m.score)
                          ? `${(m.cricketScore || m.score).team1Runs ?? (m.cricketScore || m.score).teamARuns ?? 0}/${(m.cricketScore || m.score).team1Wickets ?? (m.cricketScore || m.score).teamAWickets ?? 0}`
                          : m.sportType === 'FOOTBALL' && (m.footballScore || m.score)
                          ? (m.footballScore || m.score).team1Goals ?? (m.footballScore || m.score).teamAGoals ?? 0
                          : m.sportType === 'BASKETBALL' && (m.basketballScore || m.score)
                          ? (m.basketballScore || m.score).team1Score ?? (m.basketballScore || m.score).teamAPoints ?? 0
                          : '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-[#c2c6d6] truncate">{team2?.name}</span>
                      <span className="font-score-display text-sm font-bold text-[#c2c6d6] font-mono">
                        {m.sportType === 'CRICKET' && (m.cricketScore || m.score)
                          ? `${(m.cricketScore || m.score).team2Runs ?? (m.cricketScore || m.score).teamBRuns ?? 0}/${(m.cricketScore || m.score).team2Wickets ?? (m.cricketScore || m.score).teamBWickets ?? 0}`
                          : m.sportType === 'FOOTBALL' && (m.footballScore || m.score)
                          ? (m.footballScore || m.score).team2Goals ?? (m.footballScore || m.score).teamBGoals ?? 0
                          : m.sportType === 'BASKETBALL' && (m.basketballScore || m.score)
                          ? (m.basketballScore || m.score).team2Score ?? (m.basketballScore || m.score).teamBPoints ?? 0
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata info */}
                  <div className="space-y-1 text-xs text-[#8c909f]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#4cd7f6] shrink-0" />
                      <span>{formatDateTime(m.matchDate)}</span>
                    </div>
                    {m.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#8c909f] shrink-0" />
                        <span className="truncate">{m.venue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#252a37] flex items-center justify-between">
                  <Link
                    to={`/scoreboard/${m.id}`}
                    className="font-bold text-xs text-[#4cd7f6] hover:underline flex items-center gap-1"
                  >
                    <span>Match Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(m)}
                        aria-label="Edit"
                        className="p-1.5 rounded hover:bg-[#252a37] text-[#8c909f] hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, id: m.id, name: `${team1?.name} vs ${team2?.name}` })}
                        aria-label="Delete"
                        className="p-1.5 rounded hover:bg-red-500/10 text-[#8c909f] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule / Edit Match Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Match Schedule' : 'Schedule New Match'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Tournament *</label>
            <select
              required
              value={formData.tournamentId}
              onChange={(e) => {
                const sel = tournaments.find((t) => String(t.id) === e.target.value);
                setFormData({
                  ...formData,
                  tournamentId: e.target.value,
                  sportType: sel?.sportType || formData.sportType
                });
              }}
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            >
              <option value="">-- Select Tournament --</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.sportType})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Team 1 *</label>
              <select
                required
                value={formData.team1Id}
                onChange={(e) => setFormData({ ...formData, team1Id: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              >
                <option value="">-- Select Team 1 --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Team 2 *</label>
              <select
                required
                value={formData.team2Id}
                onChange={(e) => setFormData({ ...formData, team2Id: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              >
                <option value="">-- Select Team 2 --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Sport Type *</label>
              <select
                value={formData.sportType}
                onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              >
                <option value="CRICKET">Cricket</option>
                <option value="FOOTBALL">Football</option>
                <option value="BASKETBALL">Basketball</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.matchDate}
                onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Venue / Ground</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Pitch A • Stadium"
                className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Assign Official Scorer</label>
            <select
              value={formData.scorerId}
              onChange={(e) => setFormData({ ...formData, scorerId: e.target.value })}
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            >
              <option value="">-- Any Scorer / Open --</option>
              {scorers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252a37]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-semibold text-[#c2c6d6] hover:bg-[#252a37]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-1.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs"
            >
              {formLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Schedule Match'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Match"
        message={`Are you sure you want to delete match "${deleteDialog.name}"? This will delete all live scoring snapshots.`}
        confirmText="Delete Fixture"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default MatchesPage;
