import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { tournamentService } from '../services/tournamentService';
import { leaderboardService } from '../services/leaderboardService';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Trophy,
  RotateCw,
  Medal,
  ChevronRight,
  TrendingUp,
  Shield
} from 'lucide-react';

const LeaderboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin, isScorer } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Load all tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await tournamentService.getAll();
        if (res.success && res.data.tournaments?.length > 0) {
          setTournaments(res.data.tournaments);
          const initialId = searchParams.get('tournamentId') || String(res.data.tournaments[0].id);
          setSelectedTournamentId(initialId);
        }
      } catch (err) {
        console.error('Failed to load tournaments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Load leaderboard when selectedTournamentId changes
  useEffect(() => {
    if (!selectedTournamentId) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await leaderboardService.getByTournament(selectedTournamentId);
        if (res.success) {
          setLeaderboard(res.data.leaderboard || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedTournamentId]);

  const handleTournamentChange = (tid) => {
    setSelectedTournamentId(tid);
    setSearchParams({ tournamentId: tid });
  };

  const handleRecalculate = async () => {
    if (!selectedTournamentId) return;
    setRecalculating(true);
    try {
      const res = await leaderboardService.recalculate(selectedTournamentId);
      if (res.success) {
        setLeaderboard(res.data.leaderboard || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to recalculate leaderboard.');
    } finally {
      setRecalculating(false);
    }
  };

  const activeTournament = tournaments.find((t) => String(t.id) === String(selectedTournamentId));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Tournament Leaderboards & Standings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time points table, win rates, goal differential, and net run rates
          </p>
        </div>

        {(isAdmin || isScorer) && (
          <button
            onClick={handleRecalculate}
            disabled={recalculating || !selectedTournamentId}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-blue-400' : ''}`} />
            <span>Recalculate Points Table</span>
          </button>
        )}
      </div>

      {/* Tournament Selector Bar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-navy-900 p-3 rounded-2xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Tournament:
        </span>
        {tournaments.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTournamentChange(String(t.id))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              String(t.id) === String(selectedTournamentId)
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Cards */}
      {leaderboard.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {leaderboard.slice(0, 3).map((item, index) => {
            const medals = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
            const colors = [
              'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent',
              'border-slate-400/30 bg-gradient-to-b from-slate-400/5 to-transparent',
              'border-orange-500/30 bg-gradient-to-b from-orange-500/5 to-transparent'
            ];
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border ${colors[index]} flex items-center gap-4 shadow-lg`}
              >
                <img
                  src={item.team.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.team.name}`}
                  alt={item.team.name}
                  className="w-14 h-14 rounded-2xl bg-slate-800 p-1 border border-slate-700 object-cover shadow-md"
                />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {medals[index]}
                  </span>
                  <h4 className="text-base font-bold text-white tracking-tight line-clamp-1 mt-0.5">
                    {item.team.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-black text-white font-mono text-base">{item.points} PTS</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-mono">{item.won}W - {item.lost}L</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{activeTournament?.name || 'Tournament'} Points Standing</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {activeTournament?.sportType}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-3 text-center">Played</th>
                <th className="py-3 px-3 text-center text-emerald-400">Won</th>
                <th className="py-3 px-3 text-center text-rose-400">Lost</th>
                <th className="py-3 px-3 text-center">Drawn</th>
                <th className="py-3 px-3 text-center font-bold text-white">Points</th>
                <th className="py-3 px-4 text-right">
                  {activeTournament?.sportType === 'CRICKET' ? 'Net Run Rate' : 'Goal Difference'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    No leaderboard standings calculated yet. Points update automatically as matches complete.
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
                        className="font-bold text-white hover:text-blue-400 flex items-center gap-2.5"
                      >
                        <img
                          src={item.team.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.team.name}`}
                          alt={item.team.name}
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <span>{item.team.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({item.team.college})</span>
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
    </div>
  );
};

export default LeaderboardPage;
