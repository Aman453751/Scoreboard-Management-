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
import { formatDate } from '../utils/formatters';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#4edea3]" />
            <span>Match Results & Archives</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Historical records, finalized scores, and winning margins across collegiate tournaments
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams or venues..."
            className="w-full pl-9 pr-3 py-2 rounded bg-[#1a1f2c] border border-[#252a37] text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
          >
            <option value="ALL">All Sports</option>
            <option value="CRICKET">Cricket</option>
            <option value="FOOTBALL">Football</option>
            <option value="BASKETBALL">Basketball</option>
          </select>
        </div>

        <div className="sm:col-span-4">
          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="w-full bg-[#1a1f2c] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
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

      {/* Historical Matches Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#8c909f]">
          Loading historical match database...
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-12 text-center space-y-3">
          <History className="w-10 h-10 text-[#8c909f] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No archived matches found</h3>
          <p className="text-xs text-[#8c909f]">
            Matches will appear here as soon as they are completed and finalized.
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
                className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-4 sm:p-5 flex flex-col justify-between shadow-lg space-y-3 hover:border-[#252a37]/80 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase">
                      {m.sportType}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30 uppercase">
                      COMPLETED
                    </span>
                  </div>

                  <p className="text-xs text-[#8c909f] font-semibold truncate">
                    {m.tournament?.name}
                  </p>

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
                </div>

                <div className="pt-3 border-t border-[#252a37] flex items-center justify-between text-xs">
                  <span className="text-[#8c909f]">{formatDate(m.matchDate)}</span>
                  <Link
                    to={`/matches/${m.id}`}
                    className="font-bold text-[#4cd7f6] hover:underline flex items-center gap-1"
                  >
                    <span>Full Stats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchHistoryPage;
