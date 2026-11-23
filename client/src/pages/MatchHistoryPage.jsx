import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { tournamentService } from '../services/tournamentService';
import {
  History,
  Trophy,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { formatDate, getSportBadgeClass } from '../utils/formatters';

const MatchHistoryPage = () => {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('ALL');
  const [tournamentFilter, setTournamentFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      const params = { status: 'COMPLETED' };
      if (sportFilter !== 'ALL') params.sportType = sportFilter;
      if (tournamentFilter !== 'ALL') params.tournamentId = tournamentFilter;
      if (search) params.search = search;

      const [matchRes, tourRes] = await Promise.all([
        matchService.getAll(params),
        tournamentService.getAll()
      ]);

      if (matchRes.success) setMatches(matchRes.data.matches || []);
      if (tourRes.success) setTournaments(tourRes.data.tournaments || []);
    } catch (err) {
      console.error('Failed to load match history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [sportFilter, tournamentFilter, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-emerald-500" />
            <span>Match Results & Archives</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical records, finalized scores, and winning margins across collegiate tournaments
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-navy-900 p-4 rounded-2xl border border-slate-800">
        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or venues..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none max-w-[180px] truncate"
            >
              <option value="ALL">All Tournaments</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading completed fixtures...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 rounded-3xl bg-navy-900 border border-slate-800 text-center">
          <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No completed matches yet</h3>
          <p className="text-xs text-slate-400 mt-1">Finished games will automatically populate here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl bg-navy-900 border border-slate-800 p-6 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${getSportBadgeClass(m.sportType)}`}>
                  {m.sportType}
                </span>
                <span className="text-slate-400">{formatDate(m.matchDate)}</span>
              </div>

              <p className="text-xs text-slate-400 truncate">{m.tournament?.name}</p>

              {/* Matchup Scores */}
              <div className="space-y-3 py-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={m.teamA.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.teamA.name}`}
                      alt={m.teamA.name}
                      className="w-7 h-7 rounded-lg bg-slate-800 p-0.5 border border-slate-700"
                    />
                    <span className="text-sm font-bold text-white">{m.teamA.name}</span>
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
                      className="w-7 h-7 rounded-lg bg-slate-800 p-0.5 border border-slate-700"
                    />
                    <span className="text-sm font-bold text-white">{m.teamB.name}</span>
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

              {/* Result Summary */}
              {m.resultSummary && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-semibold text-center">
                  🏆 {m.resultSummary}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{m.venue}</span>
                <Link
                  to={`/scoreboard/${m.id}`}
                  className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span>Scorecard Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchHistoryPage;
