import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tournamentService } from '../services/tournamentService';
import { teamService } from '../services/teamService';
import { leaderboardService } from '../services/leaderboardService';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Award,
  Plus,
  Trash2,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  Radio
} from 'lucide-react';
import LiveBadge from '../components/common/LiveBadge';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/formatters';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const { isAdmin, isScorer } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('standings'); // standings, matches, teams
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Add team modal
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const loadTournamentData = async () => {
    try {
      const [tourRes, leadRes, teamsRes] = await Promise.all([
        tournamentService.getById(id),
        leaderboardService.getByTournament(id),
        teamService.getAll()
      ]);

      if (tourRes.success) setTournament(tourRes.data.tournament);
      if (leadRes.success) setLeaderboard(leadRes.data.leaderboard || []);
      if (teamsRes.success) setAllTeams(teamsRes.data.teams || []);
    } catch (err) {
      console.error('Error fetching tournament details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournamentData();
  }, [id]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await leaderboardService.recalculate(id);
      if (res.success) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to recalculate standings.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    try {
      await tournamentService.addTeam(id, selectedTeamId);
      setIsAddTeamOpen(false);
      setSelectedTeamId('');
      loadTournamentData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add team.');
    }
  };

  const handleRemoveTeam = async (teamId) => {
    if (!window.confirm('Remove this team from tournament?')) return;
    try {
      await tournamentService.removeTeam(id, teamId);
      loadTournamentData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove team.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xs font-mono text-[#8c909f]">
        Loading championship overview...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20 text-sm text-[#8c909f]">
        <p>Tournament record not found.</p>
        <Link to="/tournaments" className="mt-4 inline-block text-[#4cd7f6] font-semibold">
          ← Back to Tournaments
        </Link>
      </div>
    );
  }

  // Eligible teams to enroll (not already in tournament)
  const enrolledTeamIds = (tournament.teams || []).map((t) => t.id);
  const eligibleTeams = allTeams.filter((t) => !enrolledTeamIds.includes(t.id));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/tournaments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8c909f] hover:text-[#dee2f4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tournaments</span>
        </Link>
      </div>

      {/* Hero Overview Card (Stitch Surface) */}
      <div className="rounded-xl bg-[#161b28] border border-[#252a37] p-5 sm:p-7 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#252a37] text-[#4cd7f6] uppercase tracking-wider">
              {tournament.sportType}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded font-mono font-bold text-[11px] uppercase ${
                tournament.status === 'ONGOING'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : tournament.status === 'COMPLETED'
                  ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30'
                  : 'bg-[#252a37] text-[#8c909f]'
              }`}
            >
              {tournament.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setIsAddTeamOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enroll Team</span>
              </button>
            )}
            <Link
              to={`/leaderboard?tournamentId=${tournament.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1f2c] border border-[#252a37] hover:bg-[#252a37] text-[#dee2f4] text-xs font-semibold"
            >
              <Award className="w-3.5 h-3.5 text-[#4cd7f6]" />
              <span>Full Leaderboard</span>
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
            {tournament.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#c2c6d6] mt-1 max-w-3xl leading-relaxed">
            {tournament.description || 'Collegiate championship tournament with official real-time play-by-play scoring.'}
          </p>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#252a37] text-xs text-[#c2c6d6]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4cd7f6]" />
            <span>
              {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#4edea3]" />
            <span>{tournament.location || 'Campus Arena'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#adc6ff]" />
            <span>{tournament.teams?.length || 0} Participating Teams</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#252a37] pb-1">
        <button
          onClick={() => setActiveTab('standings')}
          className={`flex items-center gap-2 px-4 py-2 font-label-md text-xs font-semibold rounded-t border-b-2 transition-all ${
            activeTab === 'standings'
              ? 'text-[#4cd7f6] border-[#4cd7f6] bg-[#1a1f2c]'
              : 'text-[#8c909f] border-transparent hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Points Table & Standings</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-4 py-2 font-label-md text-xs font-semibold rounded-t border-b-2 transition-all ${
            activeTab === 'matches'
              ? 'text-[#4cd7f6] border-[#4cd7f6] bg-[#1a1f2c]'
              : 'text-[#8c909f] border-transparent hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tournament Matches ({tournament.matches?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 font-label-md text-xs font-semibold rounded-t border-b-2 transition-all ${
            activeTab === 'teams'
              ? 'text-[#4cd7f6] border-[#4cd7f6] bg-[#1a1f2c]'
              : 'text-[#8c909f] border-transparent hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Enrolled Teams ({tournament.teams?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: STANDINGS */}
      {activeTab === 'standings' && (
        <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] overflow-hidden shadow-lg">
          <div className="p-4 border-b border-[#252a37] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Live Tournament Standings</h3>
            {(isAdmin || isScorer) && (
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="text-xs font-semibold text-[#4cd7f6] hover:underline flex items-center gap-1.5"
              >
                <RotateCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                <span>Recalculate Table</span>
              </button>
            )}
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#8c909f]">
              No matches completed yet. Standings will populate as fixtures conclude.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090e1a] text-[#8c909f] uppercase font-label-sm text-[11px] tracking-wider border-b border-[#252a37]">
                  <tr>
                    <th className="py-2.5 px-4 w-12 text-center">Pos</th>
                    <th className="py-2.5 px-4">Team</th>
                    <th className="py-2.5 px-3 text-right">P</th>
                    <th className="py-2.5 px-3 text-right">W</th>
                    <th className="py-2.5 px-3 text-right">L</th>
                    <th className="py-2.5 px-3 text-right">D</th>
                    {tournament.sportType === 'CRICKET' ? (
                      <th className="py-2.5 px-3 text-right">NRR</th>
                    ) : (
                      <th className="py-2.5 px-3 text-right">Diff</th>
                    )}
                    <th className="py-2.5 px-4 text-right font-bold text-white">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252a37]">
                  {leaderboard.map((row, index) => (
                    <tr key={row.teamId} className="hover:bg-[#161b28]">
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-[#8c909f]">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#dee2f4]">
                        <Link to={`/teams/${row.teamId}`} className="hover:text-[#4cd7f6]">
                          {row.team?.name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#c2c6d6] tabular-nums">{row.played}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#4edea3] font-semibold tabular-nums">{row.won}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#ffb4ab] tabular-nums">{row.lost}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#8c909f] tabular-nums">{row.drawn}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#4cd7f6] tabular-nums">
                        {tournament.sportType === 'CRICKET' ? (row.netRunRate ? row.netRunRate.toFixed(3) : '0.000') : (row.goalDifference ?? row.pointsDiff ?? 0)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-sm text-white tabular-nums">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-3">
          {(!tournament.matches || tournament.matches.length === 0) ? (
            <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-10 text-center text-xs text-[#8c909f]">
              No fixtures scheduled for this tournament yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tournament.matches.map((m) => {
                const team1 = m.team1 || m.teamA;
                const team2 = m.team2 || m.teamB;

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#1a1f2c] border border-[#252a37] hover:border-[#4d8eff]/50 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#4cd7f6] font-bold text-[10px] uppercase">
                        {formatDate(m.matchDate)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          m.status === 'LIVE'
                            ? 'bg-red-500/20 text-red-400'
                            : m.status === 'COMPLETED'
                            ? 'bg-[#4edea3]/20 text-[#4edea3]'
                            : 'bg-[#252a37] text-[#8c909f]'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs sm:text-sm font-bold text-white">{team1?.name}</span>
                      <span className="text-xs text-[#8c909f]">vs</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{team2?.name}</span>
                    </div>

                    <div className="pt-2 border-t border-[#252a37] flex items-center justify-between text-xs">
                      <span className="text-[#8c909f] truncate">{m.venue || 'Arena'}</span>
                      <Link
                        to={`/scoreboard/${m.id}`}
                        className="font-semibold text-[#4cd7f6] hover:underline flex items-center gap-1"
                      >
                        <span>Match Center</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEAMS */}
      {activeTab === 'teams' && (
        <div className="space-y-3">
          {(!tournament.teams || tournament.teams.length === 0) ? (
            <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-10 text-center text-xs text-[#8c909f]">
              No teams enrolled yet. Click &quot;Enroll Team&quot; above to add teams.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {tournament.teams.map((team) => (
                <div
                  key={team.id}
                  className="p-4 rounded-xl bg-[#1a1f2c] border border-[#252a37] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-xs">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{team.name}</h4>
                      <p className="text-[11px] text-[#8c909f]">{team.department || team.college}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveTeam(team.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-[#8c909f] hover:text-red-400 transition-colors"
                      title="Remove from tournament"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enroll Team Modal */}
      <Modal
        isOpen={isAddTeamOpen}
        onClose={() => setIsAddTeamOpen(false)}
        title="Enroll Team in Tournament"
      >
        <form onSubmit={handleAddTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Select Department / Team *</label>
            <select
              required
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            >
              <option value="">-- Choose from registered teams --</option>
              {eligibleTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.department || team.college})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252a37]">
            <button
              type="button"
              onClick={() => setIsAddTeamOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-semibold text-[#c2c6d6] hover:bg-[#252a37]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTeamId}
              className="px-4 py-1.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs disabled:opacity-50"
            >
              Enroll Team
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TournamentDetailPage;
