import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Play,
  CheckCircle,
  Calendar,
  Radio,
  Clock,
  ArrowRight,
  RotateCcw,
  Trophy
} from 'lucide-react';
import LiveBadge from '../components/common/LiveBadge';

const ScorerDashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, MY_MATCHES, LIVE, UPCOMING
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const res = await matchService.getAll();
      if (res.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleStatusChange = async (matchId, newStatus) => {
    try {
      await matchService.update(matchId, { status: newStatus });
      fetchMatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update match status');
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (filter === 'MY_MATCHES') return m.scorerId === user?.id;
    if (filter === 'LIVE') return m.status === 'LIVE';
    if (filter === 'UPCOMING') return m.status === 'UPCOMING';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-[#4cd7f6] animate-pulse" />
            <span>Official Scorer Workstation</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Logged in as <strong className="text-white">{user?.name}</strong>. Start fixtures, record real-time plays, and finalize results.
          </p>
        </div>

        {/* Filter Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'MY_MATCHES', 'LIVE', 'UPCOMING'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                  : 'bg-[#1a1f2c] border border-[#252a37] text-[#c2c6d6] hover:bg-[#252a37]'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards for Scoring */}
      {filteredMatches.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#1a1f2c] border border-[#252a37] text-center space-y-2">
          <Calendar className="w-8 h-8 text-[#8c909f] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-white">No matches found</h3>
          <p className="text-xs text-[#8c909f]">
            No fixtures match your current filter selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((m) => {
            const team1 = m.team1 || m.teamA;
            const team2 = m.team2 || m.teamB;

            return (
              <div
                key={m.id}
                className="p-5 rounded-xl bg-[#1a1f2c] border border-[#252a37] hover:border-[#4d8eff]/50 transition-colors space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase">
                    {m.sportType} • {m.tournament?.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                      m.status === 'LIVE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : m.status === 'COMPLETED'
                        ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30'
                        : 'bg-[#252a37] text-[#8c909f]'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#090e1a] border border-[#1a1f2c] flex items-center justify-between font-bold text-white text-sm">
                  <span>{team1?.name}</span>
                  <span className="font-score-display text-base text-[#4cd7f6] font-mono tabular-nums">
                    {m.sportType === 'CRICKET' && (m.cricketScore || m.score)
                      ? `${(m.cricketScore || m.score).team1Runs ?? (m.cricketScore || m.score).teamARuns ?? 0}/${(m.cricketScore || m.score).team1Wickets ?? (m.cricketScore || m.score).teamAWickets ?? 0}`
                      : m.sportType === 'FOOTBALL' && (m.footballScore || m.score)
                      ? `${(m.footballScore || m.score).team1Goals ?? (m.footballScore || m.score).teamAGoals ?? 0} - ${(m.footballScore || m.score).team2Goals ?? (m.footballScore || m.score).teamBGoals ?? 0}`
                      : m.sportType === 'BASKETBALL' && (m.basketballScore || m.score)
                      ? `${(m.basketballScore || m.score).team1Score ?? (m.basketballScore || m.score).teamAPoints ?? 0} - ${(m.basketballScore || m.score).team2Score ?? (m.basketballScore || m.score).teamBPoints ?? 0}`
                      : 'VS'}
                  </span>
                  <span>{team2?.name}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#252a37]">
                  <div className="text-xs text-[#8c909f] font-mono">
                    {m.venue || 'Arena'}
                  </div>

                  <div className="flex items-center gap-2">
                    {m.status === 'UPCOMING' && (
                      <button
                        onClick={() => handleStatusChange(m.id, 'LIVE')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4edea3] hover:brightness-110 text-[#003824] font-bold text-xs shadow"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Match</span>
                      </button>
                    )}

                    {m.status === 'LIVE' && (
                      <>
                        <Link
                          to={`/scoreboard/${m.id}?mode=scorer`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow active:scale-95 transition-all"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Scoring Console</span>
                        </Link>
                        <button
                          onClick={() => handleStatusChange(m.id, 'COMPLETED')}
                          className="px-2.5 py-1.5 rounded bg-[#252a37] hover:bg-[#343947] text-[#c2c6d6] text-xs font-semibold"
                        >
                          End Match
                        </button>
                      </>
                    )}

                    {m.status === 'COMPLETED' && (
                      <Link
                        to={`/matches/${m.id}`}
                        className="text-xs font-semibold text-[#4cd7f6] hover:underline"
                      >
                        View Final Sheet →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScorerDashboard;
