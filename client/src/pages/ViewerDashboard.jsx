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
    <div className="space-y-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
            <span>Student & Viewer Sports Arena</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live scores, upcoming college fixtures, and tournament leaderboards
          </p>
        </div>

        <Link
          to="/scoreboard"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
        >
          <Radio className="w-4 h-4 text-white animate-pulse" />
          <span>Open Full Live Scoreboard</span>
        </Link>
      </div>

      {/* Live Now Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LiveBadge />
            <h3 className="text-lg font-bold text-white tracking-tight">Currently Playing</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">⚡ Live Sync Active</span>
        </div>

        {liveMatches.length === 0 ? (
          <div className="p-8 rounded-2xl bg-navy-900 border border-slate-800 text-center">
            <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No live matches right now</p>
            <p className="text-xs text-slate-500 mt-1">Upcoming games are scheduled below</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map((m) => (
              <Link
                key={m.id}
                to={`/scoreboard/${m.id}`}
                className="group p-5 rounded-2xl bg-navy-900 border border-slate-800 hover:border-blue-500/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-mono font-bold text-amber-400">{m.sportType}</span>
                    <LiveBadge />
                  </div>

                  <p className="text-xs text-slate-400 mb-3 truncate">{m.tournament?.name}</p>

                  <div className="space-y-2 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {m.teamA.name}
                      </span>
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
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {m.teamB.name}
                      </span>
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
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{m.venue}</span>
                  <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Watch Live →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Upcoming Fixtures + Active Tournaments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Fixtures */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Upcoming Matches</span>
            </h3>
            <Link to="/matches" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              Full Schedule →
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No upcoming matches scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white">
                      {m.teamA.name} <span className="text-slate-500 font-normal">vs</span> {m.teamB.name}
                    </span>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{new Date(m.matchDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{m.venue}</span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {m.sportType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tournaments Snapshot */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Tournaments & Standings</span>
            </h3>
            <Link to="/tournaments" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              All Tournaments →
            </Link>
          </div>

          <div className="space-y-3">
            {tournaments.map((t) => (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className="p-3.5 rounded-xl bg-slate-850/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {t.sportType}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
