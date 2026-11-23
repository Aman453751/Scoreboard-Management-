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
  Radio
} from 'lucide-react';
import LiveBadge from '../components/common/LiveBadge';
import Modal from '../components/common/Modal';
import { formatDate, getStatusBadgeClass, getSportBadgeClass } from '../utils/formatters';

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
    return <div className="text-center py-20 text-slate-500 text-xs">Loading tournament overview...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-20 text-slate-400 text-sm">Tournament not found.</div>;
  }

  const existingTeamIds = new Set(tournament.teams?.map((t) => t.teamId) || []);
  const availableTeamsToAdd = allTeams.filter((t) => !existingTeamIds.has(t.id));

  return (
    <div className="space-y-8">
      {/* Tournament Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-blue-950/40 border border-slate-700/80 p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${getSportBadgeClass(tournament.sportType)}`}>
              {tournament.sportType}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(tournament.status)}`}>
              {tournament.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {(isAdmin || isScorer) && (
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 disabled:opacity-50"
                title="Recalculate points from completed match results"
              >
                <RotateCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                <span>Recalculate Leaderboard</span>
              </button>
            )}

            {isAdmin && (
              <Link
                to={`/matches?action=new&tournamentId=${tournament.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Match</span>
              </Link>
            )}
          </div>
        </div>

        <div className="my-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {tournament.name}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {tournament.description || 'Official college athletic tournament featuring group round-robin matches and knockout playoffs.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{formatDate(tournament.startDate)} – {formatDate(tournament.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>{tournament.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span>{tournament.teams?.length || 0} Participating Teams</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: 'standings', label: 'Points Leaderboard', icon: Award },
          { key: 'matches', label: 'Matches & Fixtures', icon: Calendar },
          { key: 'teams', label: 'Participating Teams', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STANDINGS */}
      {activeTab === 'standings' && (
        <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Official Tournament Leaderboard Table</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Win: {tournament.sportType === 'FOOTBALL' ? '3 pts' : '2 pts'} | Draw: 1 pt | Loss: 0 pt
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Pos</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-3 text-center">P</th>
                  <th className="py-3 px-3 text-center">W</th>
                  <th className="py-3 px-3 text-center">L</th>
                  <th className="py-3 px-3 text-center">D</th>
                  <th className="py-3 px-3 text-center font-bold text-white">PTS</th>
                  <th className="py-3 px-4 text-right">
                    {tournament.sportType === 'CRICKET' ? 'NRR' : 'Diff'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                      No leaderboard standings calculated yet. Standings auto-calculate when matches finish.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        idx === 0 ? 'bg-blue-600/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                          idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400'
                        }`}>
                          {item.rank || idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/teams/${item.team.id}`}
                          className="font-bold text-white hover:text-blue-400 flex items-center gap-2"
                        >
                          <img
                            src={item.team.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.team.name}`}
                            alt={item.team.name}
                            className="w-5 h-5 rounded object-cover"
                          />
                          <span>{item.team.name}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono">{item.played}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">{item.won}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-rose-400">{item.lost}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400">{item.drawn}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-base font-black text-white bg-slate-800/40">
                        {item.points}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {item.goalDiffOrNRR >= 0 ? `+${item.goalDiffOrNRR}` : item.goalDiffOrNRR}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {tournament.matches?.length === 0 ? (
            <div className="p-10 rounded-2xl bg-navy-900 border border-slate-800 text-center text-xs text-slate-500">
              No matches scheduled for this tournament yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournament.matches.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{formatDate(m.matchDate)}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusBadgeClass(m.status)}`}>
                      {m.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white truncate">{m.teamA.name}</span>
                      <span className="text-sm font-mono font-bold text-white">
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
                      <span className="text-sm font-bold text-white truncate">{m.teamB.name}</span>
                      <span className="text-sm font-mono font-bold text-white">
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

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate max-w-[150px]">{m.venue}</span>
                    <Link
                      to={`/scoreboard/${m.id}`}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <span>Match Center</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEAMS */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Participating Teams ({tournament.teams?.length || 0})
            </h3>
            {isAdmin && (
              <button
                onClick={() => setIsAddTeamOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Team to Tournament</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournament.teams?.map((tt) => (
              <div
                key={tt.id}
                className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={tt.team.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${tt.team.name}`}
                    alt={tt.team.name}
                    className="w-10 h-10 rounded-xl bg-slate-800 p-1 border border-slate-700 object-cover"
                  />
                  <div>
                    <Link
                      to={`/teams/${tt.team.id}`}
                      className="font-bold text-white hover:text-blue-400 text-sm line-clamp-1"
                    >
                      {tt.team.name}
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tt.team.college}</p>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleRemoveTeam(tt.team.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove Team from Tournament"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      <Modal
        isOpen={isAddTeamOpen}
        onClose={() => setIsAddTeamOpen(false)}
        title="Add Participating Team"
      >
        <form onSubmit={handleAddTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Department Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose a team to register --</option>
              {availableTeamsToAdd.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.college})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddTeamOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTeamId}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 disabled:opacity-50"
            >
              Add to Tournament
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TournamentDetailPage;
