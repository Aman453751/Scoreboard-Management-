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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#4cd7f6]" />
            <span>Tournament Leaderboards & Standings</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Real-time points table, win rates, goal differential, and net run rates computed automatically
          </p>
        </div>

        {(isAdmin || isScorer) && activeTournament && (
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#1a1f2c] hover:bg-[#252a37] border border-[#252a37] text-xs font-semibold text-[#dee2f4] transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#4cd7f6] ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Table'}</span>
          </button>
        )}
      </div>

      {/* Tournament Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {tournaments.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTournamentChange(String(t.id))}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-semibold whitespace-nowrap transition-all ${
              String(t.id) === String(selectedTournamentId)
                ? 'bg-[#4d8eff] text-[#00285d] shadow'
                : 'bg-[#1a1f2c] border border-[#252a37] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{t.name}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${
              String(t.id) === String(selectedTournamentId) ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#8c909f]'
            }`}>
              {t.sportType}
            </span>
          </button>
        ))}
      </div>

      {/* Standings Table Container (Stitch Design Specification) */}
      <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] overflow-hidden shadow-lg">
        <div className="p-4 sm:p-5 border-b border-[#252a37] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{activeTournament?.name || 'Tournament Standings'}</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase">
                {activeTournament?.sportType}
              </span>
            </h2>
            <p className="text-xs text-[#8c909f] mt-0.5">
              Standings update in real time with every verified match score
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#8c909f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
            <span>Live Points Table Engine Active</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#8c909f]">
            Computing tournament telemetry...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8c909f]">
            No completed matches in this tournament yet. Scores will be reflected as soon as fixtures are played.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090e1a] text-[#8c909f] uppercase font-label-sm text-[11px] tracking-wider border-b border-[#252a37]">
                <tr>
                  <th className="py-3 px-4 w-14 text-center">Rank</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-3 text-right">P</th>
                  <th className="py-3 px-3 text-right">W</th>
                  <th className="py-3 px-3 text-right">L</th>
                  <th className="py-3 px-3 text-right">D</th>
                  {activeTournament?.sportType === 'CRICKET' ? (
                    <th className="py-3 px-3 text-right">NRR</th>
                  ) : activeTournament?.sportType === 'FOOTBALL' ? (
                    <>
                      <th className="py-3 px-3 text-right">GF</th>
                      <th className="py-3 px-3 text-right">GA</th>
                      <th className="py-3 px-3 text-right">GD</th>
                    </>
                  ) : (
                    <th className="py-3 px-3 text-right">Diff</th>
                  )}
                  <th className="py-3 px-4 text-right font-bold text-[#dee2f4]">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252a37]">
                {leaderboard.map((row, index) => {
                  const isTop3 = index < 3;
                  const rankBadgeClass =
                    index === 0
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : index === 1
                      ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30'
                      : index === 2
                      ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                      : 'text-[#8c909f]';

                  return (
                    <tr
                      key={row.id || row.teamId}
                      className="hover:bg-[#161b28] transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs ${rankBadgeClass}`}>
                          {index + 1}
                        </span>
                      </td>

                      {/* Team Name */}
                      <td className="py-3 px-4">
                        <Link
                          to={`/teams/${row.teamId}`}
                          className="flex items-center gap-2.5 font-bold text-[#dee2f4] hover:text-[#4cd7f6] transition-colors"
                        >
                          <div className="w-6 h-6 rounded bg-[#252a37] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {row.team?.name?.substring(0, 2).toUpperCase() || 'TM'}
                          </div>
                          <span>{row.team?.name}</span>
                        </Link>
                      </td>

                      {/* Played, Won, Lost, Draw */}
                      <td className="py-3 px-3 text-right font-mono text-[#c2c6d6] tabular-nums">{row.played}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#4edea3] font-semibold tabular-nums">{row.won}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#ffb4ab] tabular-nums">{row.lost}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#8c909f] tabular-nums">{row.drawn}</td>

                      {/* Sport specific statistics */}
                      {activeTournament?.sportType === 'CRICKET' ? (
                        <td className="py-3 px-3 text-right font-mono text-[#4cd7f6] tabular-nums">
                          {row.netRunRate ? row.netRunRate.toFixed(3) : '0.000'}
                        </td>
                      ) : activeTournament?.sportType === 'FOOTBALL' ? (
                        <>
                          <td className="py-3 px-3 text-right font-mono text-[#c2c6d6] tabular-nums">{row.goalsFor ?? 0}</td>
                          <td className="py-3 px-3 text-right font-mono text-[#8c909f] tabular-nums">{row.goalsAgainst ?? 0}</td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-[#4cd7f6] tabular-nums">
                            {(row.goalDifference ?? 0) > 0 ? `+${row.goalDifference}` : row.goalDifference ?? 0}
                          </td>
                        </>
                      ) : (
                        <td className="py-3 px-3 text-right font-mono text-[#4cd7f6] tabular-nums">
                          {row.pointsDiff ?? 0}
                        </td>
                      )}

                      {/* Total Points */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-base text-white tabular-nums">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
