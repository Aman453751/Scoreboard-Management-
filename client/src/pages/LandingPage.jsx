import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { statsService } from '../services/statsService';
import { useSocket } from '../context/SocketContext';
import {
  Trophy,
  Activity,
  Shield,
  Users,
  ChevronRight,
  Radio,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  Timer,
  RotateCcw,
  Sliders,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import LiveBadge from '../components/common/LiveBadge';
import { formatCricketOvers, calculateRunRate } from '../utils/formatters';

const LandingPage = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSportTab, setActiveSportTab] = useState('CRICKET');
  const { socket, isConnected } = useSocket();

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

  // Featured game for the hero section
  const featuredMatch = liveMatches.length > 0 ? liveMatches[0] : null;

  return (
    <div className="space-y-14">
      {/* 1. HERO SECTION */}
      <section className="bg-navy-900 border border-slate-800 rounded-xl p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800/90 border border-slate-700 text-slate-300 text-[11px] font-mono uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              College Sports Operations Platform
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Real-Time Sports Scoreboard & Tournaments
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                A centralized sports management platform for college administrators, official scorers, and students. Manage multi-sport tournaments, log play-by-play scoring with instant undo, and track live department leaderboards.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/scoreboard"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Watch Live Scores</span>
              </Link>

              <Link
                to="/tournaments"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-slate-400" />
                <span>Tournaments & Brackets</span>
              </Link>

              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Platform Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
              <div className="border-l-2 border-slate-700 pl-3">
                <span className="text-2xl font-black text-white font-mono block">
                  {stats?.totalTournaments ?? 3}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Tournaments</span>
              </div>
              <div className="border-l-2 border-slate-700 pl-3">
                <span className="text-2xl font-black text-white font-mono block">
                  {stats?.totalTeams ?? 6}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">College Teams</span>
              </div>
              <div className="border-l-2 border-slate-700 pl-3">
                <span className="text-2xl font-black text-rose-400 font-mono block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  {stats?.liveMatches ?? liveMatches.length}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Live Contests</span>
              </div>
              <div className="border-l-2 border-slate-700 pl-3">
                <span className="text-2xl font-black text-emerald-400 font-mono block">
                  &lt;100ms
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Socket.IO Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Featured Match Card */}
          <div className="lg:col-span-5">
            {featuredMatch ? (
              <div className="bg-navy-950 border border-slate-700/80 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 uppercase">
                      {featuredMatch.sportType}
                    </span>
                    <span className="text-xs text-slate-400 truncate max-w-[180px]">
                      {featuredMatch.tournament?.name}
                    </span>
                  </div>
                  <LiveBadge />
                </div>

                {/* Matchup Rows */}
                <div className="space-y-3 py-1">
                  {/* Team A */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={featuredMatch.teamA.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${featuredMatch.teamA.name}`}
                        alt={featuredMatch.teamA.name}
                        className="w-8 h-8 rounded bg-slate-800 p-1 border border-slate-700 object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{featuredMatch.teamA.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{featuredMatch.teamA.college}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white font-mono tabular-nums">
                        {featuredMatch.sportType === 'CRICKET' && featuredMatch.score
                          ? `${featuredMatch.score.teamARuns}/${featuredMatch.score.teamAWickets}`
                          : featuredMatch.sportType === 'FOOTBALL' && featuredMatch.score
                          ? featuredMatch.score.teamAGoals
                          : featuredMatch.sportType === 'BASKETBALL' && featuredMatch.score
                          ? featuredMatch.score.teamAPoints
                          : '-'}
                      </span>
                      {featuredMatch.sportType === 'CRICKET' && featuredMatch.score && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ({formatCricketOvers(featuredMatch.score.teamABalls)} ov)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={featuredMatch.teamB.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${featuredMatch.teamB.name}`}
                        alt={featuredMatch.teamB.name}
                        className="w-8 h-8 rounded bg-slate-800 p-1 border border-slate-700 object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{featuredMatch.teamB.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{featuredMatch.teamB.college}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white font-mono tabular-nums">
                        {featuredMatch.sportType === 'CRICKET' && featuredMatch.score
                          ? `${featuredMatch.score.teamBRuns}/${featuredMatch.score.teamBWickets}`
                          : featuredMatch.sportType === 'FOOTBALL' && featuredMatch.score
                          ? featuredMatch.score.teamBGoals
                          : featuredMatch.sportType === 'BASKETBALL' && featuredMatch.score
                          ? featuredMatch.score.teamBPoints
                          : '-'}
                      </span>
                      {featuredMatch.sportType === 'CRICKET' && featuredMatch.score && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ({formatCricketOvers(featuredMatch.score.teamBBalls)} ov)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Equation / Status Bar */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-white">Status:</span>
                    <span className="text-slate-300 font-mono">{featuredMatch.currentPeriod || 'Live Action'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{featuredMatch.venue}</span>
                </div>

                <Link
                  to={`/scoreboard/${featuredMatch.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                >
                  <span>Open Live Scoreboard Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="bg-navy-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
                <Activity className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">Scheduled Fixtures Queued</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No match is currently in LIVE status. Official scorers can start scheduled matches from the match operations console.
                </p>
                <Link
                  to="/matches"
                  className="inline-block px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
                >
                  View Scheduled Matches
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. ACTIVE LIVE MATCHES SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <LiveBadge />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Active Live Matches</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official fixtures currently being scored in real time with WebSocket broadcast
              </p>
            </div>
          </div>
          <Link
            to="/scoreboard"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Live Center</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {liveMatches.length === 0 ? (
          <div className="p-8 rounded-xl bg-navy-900 border border-slate-800 text-center text-xs text-slate-400">
            No live matches active at this moment. Explore upcoming match schedules or past results.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveMatches.map((m) => {
              const isCricket = m.sportType === 'CRICKET';
              const isFootball = m.sportType === 'FOOTBALL';
              const isBasketball = m.sportType === 'BASKETBALL';

              return (
                <Link
                  key={m.id}
                  to={`/scoreboard/${m.id}`}
                  className="bg-navy-900 hover:bg-navy-850 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                          {m.sportType}
                        </span>
                        <span className="text-slate-400 text-[11px] truncate max-w-[150px]">
                          {m.tournament?.name}
                        </span>
                      </div>
                      <LiveBadge />
                    </div>

                    {/* Team Matchup Rows */}
                    <div className="space-y-2.5 py-1">
                      {/* Team A */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={m.teamA.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.teamA.name}`}
                            alt={m.teamA.name}
                            className="w-6 h-6 rounded bg-slate-800 p-0.5 border border-slate-700 object-cover shrink-0"
                          />
                          <span className="text-sm font-bold text-white truncate max-w-[170px]">{m.teamA.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-white font-mono tabular-nums">
                            {isCricket && m.score
                              ? `${m.score.teamARuns}/${m.score.teamAWickets}`
                              : isFootball && m.score
                              ? m.score.teamAGoals
                              : isBasketball && m.score
                              ? m.score.teamAPoints
                              : '-'}
                          </span>
                          {isCricket && m.score && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ({formatCricketOvers(m.score.teamABalls)} ov)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Team B */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={m.teamB.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.teamB.name}`}
                            alt={m.teamB.name}
                            className="w-6 h-6 rounded bg-slate-800 p-0.5 border border-slate-700 object-cover shrink-0"
                          />
                          <span className="text-sm font-bold text-white truncate max-w-[170px]">{m.teamB.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-white font-mono tabular-nums">
                            {isCricket && m.score
                              ? `${m.score.teamBRuns}/${m.score.teamBWickets}`
                              : isFootball && m.score
                              ? m.score.teamBGoals
                              : isBasketball && m.score
                              ? m.score.teamBPoints
                              : '-'}
                          </span>
                          {isCricket && m.score && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ({formatCricketOvers(m.score.teamBBalls)} ov)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Metadata & Action */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-slate-300">{m.currentPeriod || 'Live'}</span>
                    <span className="text-blue-400 font-semibold flex items-center gap-1 hover:text-blue-300">
                      Scoreboard Console →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. MULTI-SPORT SCORING ENGINES (Structured Technical Breakdown) */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Multi-Sport Scoring Engines</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sport-specific scoring algorithms with legal ball validation, match clocks, and snapshot rollbacks
            </p>
          </div>

          {/* Engine Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-navy-900 border border-slate-800">
            {[
              { id: 'CRICKET', label: 'Cricket T20' },
              { id: 'FOOTBALL', label: 'Football / Soccer' },
              { id: 'BASKETBALL', label: 'Basketball' }
            ].map((sport) => (
              <button
                key={sport.id}
                onClick={() => setActiveSportTab(sport.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeSportTab === sport.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>
        </div>

        {/* Engine Specification Display */}
        <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 lg:p-8">
          {activeSportTab === 'CRICKET' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  CRICKET SCORING MATRIX
                </div>
                <h3 className="text-xl font-bold text-white">Ball-by-Ball Collegiate T20 Scoring</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  The cricket scoring engine tracks legal delivery progression, runs per ball (0, 1, 2, 3, 4, 6), fall of wickets, and extra-ball categories without manual arithmetic mistakes.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white block">Delivery & Overs Rules</span>
                    <p className="text-xs text-slate-400">
                      Legal balls increment the over (`15.1`, `15.2`). Wide balls and No Balls award extra runs without advancing the legal ball count.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white block">Chasing Equations</span>
                    <p className="text-xs text-slate-400">
                      Automatic Current Run Rate (CRR), Required Run Rate (RRR), and target differential for Inning 2 chases.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-navy-950 border border-slate-800 rounded-lg p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span>SCORER CONSOLE SIMULATION</span>
                  <span className="text-emerald-400">ACTIVE ENGINE</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standard Delivery:</span>
                    <span className="font-bold text-white">0, 1, 2, 3, 4 (Boundary), 6 (Six)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Extras Supported:</span>
                    <span className="text-amber-400">Wide, No Ball, Bye, Leg Bye</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Innings Phase:</span>
                    <span className="text-blue-400">1st Inning / 2nd Inning Chase</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Undo Capability:</span>
                    <span className="text-emerald-400">Zero-Latency State Rollback</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSportTab === 'FOOTBALL' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  FOOTBALL MATCH PROTOCOL
                </div>
                <h3 className="text-xl font-bold text-white">Soccer League & Tournament Engine</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Tailored for university soccer fixtures with official match minute clock synchronization, half-time management, goal attribution, and disciplinary card tracking.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white block">Match Halves & Clock</span>
                    <p className="text-xs text-slate-400">
                      Phase transitions for 1st Half, Half Time, 2nd Half, and Full Time with granular match minute stamps (`24'`, `68'`).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white block">Disciplinary Logging</span>
                    <p className="text-xs text-slate-400">
                      Instant tracking of yellow cards, direct red cards, and goal scorer records for post-match disciplinary reviews.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-navy-950 border border-slate-800 rounded-lg p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span>FOOTBALL CONSOLE SIMULATION</span>
                  <span className="text-emerald-400">ACTIVE ENGINE</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Goal Tracking:</span>
                    <span className="font-bold text-white">Team A Goals vs Team B Goals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timer Controls:</span>
                    <span className="text-blue-400">Minute Increment & Direct Sync</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card Registry:</span>
                    <span className="text-amber-400">🟨 Yellow / 🟥 Red Cards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standings Impact:</span>
                    <span className="text-emerald-400">Win: 3 pts, Draw: 1 pt, Goal Diff</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSportTab === 'BASKETBALL' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  BASKETBALL SCORING SYSTEM
                </div>
                <h3 className="text-xl font-bold text-white">Court Quarters & Multi-Point Scoring</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Supports full collegiate basketball scoring with 1-point free throws, 2-point field goals, 3-point downtown triples, team fouls, and quarter countdown clocks.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white block">Quarter Management</span>
                    <p className="text-xs text-slate-400">
                      Standard Q1 through Q4 quarter transitions plus Overtime (OT) with dedicated quarter clock remaining (`04:18`).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white block">Penalty & Fouls</span>
                    <p className="text-xs text-slate-400">
                      Team foul counts tracked on both sides to automatically monitor bonus and double-bonus penalty situations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-navy-950 border border-slate-800 rounded-lg p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span>BASKETBALL CONSOLE SIMULATION</span>
                  <span className="text-emerald-400">ACTIVE ENGINE</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scoring Increments:</span>
                    <span className="font-bold text-white">+1 Free Throw, +2 Field, +3 Triples</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quarter Format:</span>
                    <span className="text-blue-400">Q1, Q2, Q3, Q4 & Overtime</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Foul Counter:</span>
                    <span className="text-rose-400">Team Fouls A & B Monitored</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standings Impact:</span>
                    <span className="text-emerald-400">Win: 2 pts, Loss: 0 pt, Pt Diff</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. PLATFORM FEATURES (Organized by User Role) */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-tight">Collegiate Operational Architecture</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based workflows tailored for athletic directors, match officials, and campus spectators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role 1: Administrator */}
          <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">Access Tier: Admin</span>
              <h3 className="text-base font-bold text-white mt-1">Tournament & League Operations</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Create and schedule tournaments across Cricket, Football, and Basketball.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Register collegiate teams, assign team captains, and manage player lineups.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Designate official scorers and delegate fixture scoring permissions.</span>
              </li>
            </ul>
          </div>

          {/* Role 2: Official Scorer */}
          <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Access Tier: Scorer</span>
              <h3 className="text-base font-bold text-white mt-1">Live Scoring & State Rollback</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Dedicated Scorer Workstation listing all fixtures assigned to your account.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Instant ball-by-ball and goal scoring with single-key rapid data entry.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Foolproof Undo: Snapshot-based rollback restores score and event state immediately.</span>
              </li>
            </ul>
          </div>

          {/* Role 3: Students & Viewers */}
          <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Access Tier: Viewer</span>
              <h3 className="text-base font-bold text-white mt-1">Campus Community & Standings</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero page refresh updates via real-time WebSocket broadcast channels.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Live tournament standings with automatic points, goal difference, and run rates.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Complete match history archives and individual department squad performance.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
