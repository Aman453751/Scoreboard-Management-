import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { statsService } from '../services/statsService';
import { useSocket } from '../context/SocketContext';
import {
  Trophy,
  Activity,
  Flame,
  Shield,
  Zap,
  Users,
  ChevronRight,
  Radio,
  ArrowRight,
  Award,
  Sparkles,
  Calendar
} from 'lucide-react';
import LiveBadge from '../components/common/LiveBadge';

const LandingPage = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchData = async () => {
    try {
      const [matchesRes, statsRes] = await Promise.all([
        matchService.getAll({ status: 'LIVE' }),
        statsService.getDashboardStats()
      ]);
      if (matchesRes.success) setLiveMatches(matchesRes.data.matches || []);
      if (statsRes.success) setStats(statsRes.data.counts || null);
    } catch (err) {
      console.warn('Error loading landing page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Socket listener for live score updates on landing page
  useEffect(() => {
    if (!socket) return;
    const handleGlobalUpdate = () => {
      fetchData();
    };
    socket.on('global_score_update', handleGlobalUpdate);
    socket.on('live_matches_refresh', handleGlobalUpdate);

    return () => {
      socket.off('global_score_update', handleGlobalUpdate);
      socket.off('live_matches_refresh', handleGlobalUpdate);
    };
  }, [socket]);

  return (
    <div className="space-y-20 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-blue-950/60 border border-slate-700/80 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Next-Gen College Sports Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Real-Time Sports <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Scoreboard & Tournaments
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A centralized sports management ecosystem for college athletics. Manage multi-sport tournaments, update live ball-by-ball & play-by-play scores with zero page reload, and track automated department leaderboards.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/scoreboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <span>Watch Live Scores</span>
            </Link>

            <Link
              to="/tournaments"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:text-white"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Explore Tournaments</span>
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <span>Official Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Real-Time Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats?.totalTournaments ?? 3}</p>
              <p className="text-xs text-slate-400">Tournaments</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats?.totalTeams ?? 6}</p>
              <p className="text-xs text-slate-400">Department Teams</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-rose-400 font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                {stats?.liveMatches ?? liveMatches.length}
              </p>
              <p className="text-xs text-slate-400">Live Matches</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">100%</p>
              <p className="text-xs text-slate-400">Socket.IO Live Sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Match Preview Widget */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LiveBadge />
              <h2 className="text-2xl font-bold text-white tracking-tight">Active Live Matches</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized in real-time across connected clients via WebSockets
            </p>
          </div>
          <Link
            to="/scoreboard"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Live</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {liveMatches.length === 0 ? (
          <div className="p-8 rounded-2xl bg-navy-900 border border-slate-800 text-center">
            <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No matches currently in progress</p>
            <p className="text-xs text-slate-500 mt-1">Check the schedule for upcoming sports fixtures</p>
            <Link
              to="/matches"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30"
            >
              View Match Schedule
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map((m) => (
              <Link
                key={m.id}
                to={`/scoreboard/${m.id}`}
                className="group relative rounded-2xl bg-navy-900 border border-slate-800 hover:border-blue-500/50 p-5 transition-all hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono font-semibold text-amber-400">{m.sportType}</span>
                  <LiveBadge />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {m.teamA.name}
                    </span>
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
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {m.teamB.name}
                    </span>
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

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{m.venue}</span>
                  <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Live Scoreboard →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Supported Sports Categories */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Multi-Sport Scoring Engines
          </h2>
          <p className="text-sm text-slate-400">
            Tailored scoring algorithms, overs and run-rate formulas, goal clocks, and quarter timelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cricket Card */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <span className="text-2xl">🏏</span>
            </div>
            <h3 className="text-lg font-bold text-white">Cricket T20 & One-Day</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Legal ball counting, runs per ball (0, 1, 2, 3, 4, 6), wickets, extras (wides, no balls, byes), current & required run-rate, target chasing calculations, and innings transition.
            </p>
            <ul className="text-xs text-slate-300 space-y-1 font-mono">
              <li>✓ Inning 1 & Inning 2 Target Calculator</li>
              <li>✓ Instant Undo of Last Ball</li>
            </ul>
          </div>

          {/* Football Card */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="text-2xl">⚽</span>
            </div>
            <h3 className="text-lg font-bold text-white">Football / Soccer League</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Match minute tracking, 1st Half, Half Time, 2nd Half and Full Time management. Goal recording with minute timestamps, yellow cards, and direct red cards.
            </p>
            <ul className="text-xs text-slate-300 space-y-1 font-mono">
              <li>✓ Goal Differential Analytics</li>
              <li>✓ Disciplinary Card Tracking</li>
            </ul>
          </div>

          {/* Basketball Card */}
          <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 hover:border-orange-500/40 transition-colors space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <span className="text-2xl">🏀</span>
            </div>
            <h3 className="text-lg font-bold text-white">Basketball Championship</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quarter tracking (Q1 to Q4 and Overtime), 1-point free throws, 2-point field goals, 3-point downtown triples, team fouls, and quarter countdown clocks.
            </p>
            <ul className="text-xs text-slate-300 space-y-1 font-mono">
              <li>✓ Lead Differential Display</li>
              <li>✓ Play-by-Play Event Timeline</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="rounded-3xl bg-slate-900/40 border border-slate-800 p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Built for Administrators, Scorers & Students
          </h2>
          <p className="text-sm text-slate-400">
            Engineered with strict role-based access control, relational database integrity, and high-performance WebSockets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <h4 className="text-sm font-bold text-white">Role-Based Access</h4>
            <p className="text-xs text-slate-400">
              Dedicated dashboards for Admin, Scorer, and Viewer roles with backend authorization tokens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Foolproof Undo</h4>
            <p className="text-xs text-slate-400">
              Each scoring event retains an immutable pre-event snapshot, allowing scorers to undo mistaken balls or goals instantly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2">
            <Award className="w-6 h-6 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Automated Leaderboards</h4>
            <p className="text-xs text-slate-400">
              Standings tables recalculate points, wins, losses, draws, and Net Run Rate / Goal Differential on match completion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Zero Refresh Updates</h4>
            <p className="text-xs text-slate-400">
              Viewers across all devices receive instant score updates via Socket.IO bidirectional channels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
