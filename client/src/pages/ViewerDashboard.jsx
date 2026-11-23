import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { tournamentService } from '../services/tournamentService';
import { useSocket } from '../context/SocketContext';
import {
  Activity,
  Trophy,
  Award,
  Calendar,
  Radio,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import LiveBadge from '../components/common/LiveBadge';

const ViewerDashboard = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const loadData = async () => {
    try {
      const [liveRes, upcomingRes, tourRes] = await Promise.all([
        matchService.getAll({ status: 'LIVE' }),
        matchService.getAll({ status: 'UPCOMING' }),
        tournamentService.getAll()
      ]);
      if (liveRes.success) setLiveMatches(liveRes.data.matches || []);
      if (upcomingRes.success) setUpcomingMatches(upcomingRes.data.matches?.slice(0, 4) || []);
      if (tourRes.success) setTournaments(tourRes.data.tournaments || []);
    } catch (err) {
      console.error('Error loading viewer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => loadData();
    socket.on('global_score_update', handleUpdate);
    socket.on('live_matches_refresh', handleUpdate);
    return () => {
      socket.off('global_score_update', handleUpdate);
      socket.off('live_matches_refresh', handleUpdate);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-[#4cd7f6] animate-pulse" />
            <span>Collegiate Spectator Hub</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Real-time live scores, upcoming campus matches, and department tournament standings
          </p>
        </div>

        <Link
          to="/scoreboard"
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow active:scale-95 transition-all self-start sm:self-auto"
        >
          <Radio className="w-4 h-4" />
          <span>Open Full Scoreboard</span>
        </Link>
      </div>

      {/* Live Now Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <h2 className="text-base font-bold text-white">Live Matches In Progress ({liveMatches.length})</h2>
          </div>
          <Link to="/scoreboard" className="text-xs text-[#4cd7f6] hover:underline font-semibold">
            All Live Broadcasts →
          </Link>
        </div>

        {liveMatches.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#1a1f2c] border border-[#252a37] text-center text-xs text-[#8c909f]">
            No live games on court right now. Check upcoming fixtures below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((m) => {
              const team1 = m.team1 || m.teamA;
              const team2 = m.team2 || m.teamB;

              return (
                <Link
                  key={m.id}
                  to={`/scoreboard/${m.id}`}
                  className="p-4 rounded-xl bg-[#1a1f2c] border border-[#252a37] hover:border-[#4d8eff]/50 transition-colors space-y-3 block shadow-lg"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase">
                      {m.sportType}
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                      LIVE
                    </span>
                  </div>

                  <p className="text-xs text-[#8c909f] font-semibold truncate">
                    {m.tournament?.name}
                  </p>

                  <div className="p-3 rounded-lg bg-[#090e1a] border border-[#1a1f2c] space-y-1.5 text-xs sm:text-sm font-bold text-white">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{team1?.name}</span>
                      <span className="font-mono text-[#4cd7f6] tabular-nums">
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
                      <span className="truncate">{team2?.name}</span>
                      <span className="font-mono text-[#4cd7f6] tabular-nums">
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

                  <div className="flex items-center justify-between pt-1 text-xs text-[#8c909f]">
                    <span>{m.venue || 'Court 1'}</span>
                    <span className="text-[#4cd7f6] font-semibold">Watch Live →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Games Strip */}
      <div className="space-y-3 pt-4 border-t border-[#252a37]">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#4cd7f6]" />
          <span>Next Scheduled Fixtures</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {upcomingMatches.map((m) => {
            const team1 = m.team1 || m.teamA;
            const team2 = m.team2 || m.teamB;

            return (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-[#1a1f2c] border border-[#252a37] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[#4cd7f6] font-bold uppercase">{m.sportType}</span>
                  <span className="text-[#8c909f]">{new Date(m.matchDate).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-white truncate">
                  {team1?.name} vs {team2?.name}
                </div>
                <div className="pt-2 border-t border-[#252a37] flex items-center justify-between text-[#8c909f]">
                  <span className="truncate">{m.venue || 'Stadium'}</span>
                  <Link to={`/scoreboard/${m.id}`} className="text-[#4cd7f6] hover:underline font-semibold">
                    Preview →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
