import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { statsService } from '../services/statsService';
import { useSocket } from '../context/SocketContext';
import {
  Trophy,
  Activity,
  Shield,
  Users,
  ChevronRight,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  Timer,
  RotateCcw,
  Sliders,
  TrendingUp,
  BarChart3,
  Star,
  ExternalLink,
  Zap,
  Lock,
  Flame
} from 'lucide-react';
import { formatCricketOvers, calculateRunRate } from '../utils/formatters';

const LandingPage = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('ALL');
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [liveRes, allRes, statsRes] = await Promise.all([
        matchService.getAll({ status: 'LIVE' }),
        matchService.getAll({ limit: 10 }),
        statsService.getDashboardStats()
      ]);
      if (liveRes.success) setLiveMatches(liveRes.data.matches || []);
      if (allRes.success) setAllMatches(allRes.data.matches || []);
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
    const handleScoreUpdate = () => {
      fetchData();
    };
    socket.on('global_score_update', handleScoreUpdate);
    socket.on('live_matches_refresh', handleScoreUpdate);

    return () => {
      socket.off('global_score_update', handleScoreUpdate);
      socket.off('live_matches_refresh', handleScoreUpdate);
    };
  }, [socket]);

  // Filter matches based on selected sport chip
  const filteredMatches = (liveMatches.length > 0 ? liveMatches : allMatches).filter((m) => {
    if (selectedSport === 'ALL') return true;
    return m.sportType === selectedSport;
  });

  const featuredMatch = liveMatches.length > 0 ? liveMatches[0] : (allMatches.length > 0 ? allMatches[0] : null);
  const secondaryMatches = liveMatches.length > 1 ? liveMatches.slice(1) : allMatches.filter(m => m.id !== featuredMatch?.id).slice(0, 4);

  // Counts for sport filter chips
  const countAll = liveMatches.length > 0 ? liveMatches.length : allMatches.length;
  const countBasketball = (liveMatches.length > 0 ? liveMatches : allMatches).filter(m => m.sportType === 'BASKETBALL').length;
  const countCricket = (liveMatches.length > 0 ? liveMatches : allMatches).filter(m => m.sportType === 'CRICKET').length;
  const countFootball = (liveMatches.length > 0 ? liveMatches : allMatches).filter(m => m.sportType === 'FOOTBALL').length;

  return (
    <div className="flex flex-col w-full pb-8 space-y-6">
      {/* 1. TOP TICKER PILL & HORIZONTAL SPORT CHIPS (Exact Stitch Specification) */}
      <section className="pt-1">
        <div className="flex items-center justify-between bg-[#1a1f2c] border border-[#252a37] px-3.5 py-1.5 rounded-full shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${liveMatches.length > 0 ? 'bg-red-500' : 'bg-[#4edea3]'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${liveMatches.length > 0 ? 'bg-red-500' : 'bg-[#4edea3]'}`}></span>
            </span>
            <span className="font-label-sm text-xs uppercase tracking-wider text-[#dee2f4] font-semibold truncate">
              {liveMatches.length > 0 ? `${liveMatches.length} Live Matches in Progress` : 'All Collegiate Divisions Synced'}
            </span>
          </div>
          <span className={`font-stat-mono text-xs flex-shrink-0 font-mono font-bold ${isConnected ? 'text-[#4cd7f6]' : 'text-amber-400'}`}>
            {isConnected ? 'SYNCED' : 'STANDBY'}
          </span>
        </div>

        {/* Sport Filters Ribbon */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedSport('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all active:scale-95 ${
              selectedSport === 'ALL'
                ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                : 'bg-[#1a1f2c] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sports</span>
            <span>All</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ml-0.5 ${selectedSport === 'ALL' ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#c2c6d6]'}`}>
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setSelectedSport('BASKETBALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all active:scale-95 ${
              selectedSport === 'BASKETBALL'
                ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                : 'bg-[#1a1f2c] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sports_basketball</span>
            <span>Basketball</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ml-0.5 ${selectedSport === 'BASKETBALL' ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#c2c6d6]'}`}>
              {countBasketball}
            </span>
          </button>

          <button
            onClick={() => setSelectedSport('CRICKET')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all active:scale-95 ${
              selectedSport === 'CRICKET'
                ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                : 'bg-[#1a1f2c] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sports_cricket</span>
            <span>Cricket</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ml-0.5 ${selectedSport === 'CRICKET' ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#c2c6d6]'}`}>
              {countCricket}
            </span>
          </button>

          <button
            onClick={() => setSelectedSport('FOOTBALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all active:scale-95 ${
              selectedSport === 'FOOTBALL'
                ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                : 'bg-[#1a1f2c] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sports_soccer</span>
            <span>Football</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ml-0.5 ${selectedSport === 'FOOTBALL' ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#c2c6d6]'}`}>
              {countFootball}
            </span>
          </button>
        </div>
      </section>

      {/* 2. HERO BANNER WITH TELEMETRY STATS STRIP (Stitch Exact) */}
      <section>
        <div className="relative overflow-hidden rounded-xl bg-[#161b28] border border-[#252a37] p-5 sm:p-7 shadow-lg">
          {/* Glow ambient accent */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#4cd7f6]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#252a37] text-[#4cd7f6] w-fit">
              <span className="material-symbols-outlined text-[14px]">military_tech</span>
              <span className="font-label-sm text-[11px] uppercase tracking-widest font-semibold">
                Collegiate Sports Operations
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#dee2f4] leading-tight tracking-tight">
              Every Game. Every Score. <span className="text-[#4cd7f6]">One Platform.</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#c2c6d6] leading-relaxed max-w-2xl">
              Real-time scoreboards, live bracket seeding, and rapid sideline tournament ops for university leagues. Official scoring consoles with single-tap rollback for Cricket, Football, and Basketball.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/scoreboard"
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded bg-[#4d8eff] text-[#00285d] font-label-md text-xs font-bold shadow hover:bg-[#3b82f6] active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                <span>Watch Live Scores</span>
              </Link>
              <Link
                to="/tournaments"
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded bg-[#252a37] text-[#dee2f4] font-label-md text-xs font-semibold hover:bg-[#343947] active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                <span>Explore Brackets</span>
              </Link>
            </div>

            {/* Telemetry Stats Strip */}
            <div className="grid grid-cols-3 gap-3 pt-3 mt-2 rounded-lg bg-[#090e1a] border border-[#1a1f2c] p-3">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-stat-mono text-xl sm:text-2xl text-[#dee2f4] font-bold font-mono">
                  {stats?.totalTournaments ?? 3}
                </span>
                <span className="font-label-sm text-[10px] sm:text-[11px] text-[#8c909f] uppercase tracking-wider">
                  Tournaments
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-stat-mono text-xl sm:text-2xl text-[#4cd7f6] font-bold font-mono">
                  {stats?.totalTeams ?? 6}
                </span>
                <span className="font-label-sm text-[10px] sm:text-[11px] text-[#8c909f] uppercase tracking-wider">
                  Teams
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                  <span className="font-stat-mono text-xl sm:text-2xl text-[#4edea3] font-bold font-mono">
                    &lt;100ms
                  </span>
                </div>
                <span className="font-label-sm text-[10px] sm:text-[11px] text-[#8c909f] uppercase tracking-wider">
                  Sync Latency
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED HEADLINE GAME (Stitch Exact Layout) */}
      {featuredMatch && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">star</span>
              <h2 className="font-headline-sm text-base sm:text-lg text-[#dee2f4] font-bold">
                Headline Game
              </h2>
            </div>
            <span className="font-label-sm text-xs text-[#8c909f] uppercase tracking-wider font-semibold">
              {featuredMatch.venue || 'Main Campus Arena'}
            </span>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-[#1a1f2c] border border-[#252a37] p-4 sm:p-5 shadow-lg">
            {/* Ambient live pulse glow */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Match Metadata Header */}
            <div className="flex items-center justify-between pb-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#252a37] text-[#dee2f4] font-label-sm text-xs flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">
                    {featuredMatch.sportType === 'BASKETBALL' ? 'sports_basketball' : featuredMatch.sportType === 'CRICKET' ? 'sports_cricket' : 'sports_soccer'}
                  </span>
                  <span>{featuredMatch.tournament?.name || 'Varsity Championship'}</span>
                </span>
              </div>

              {featuredMatch.status === 'LIVE' ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-label-sm text-xs font-bold uppercase tracking-wider">
                    {featuredMatch.sportType === 'BASKETBALL' && (featuredMatch.basketballScore?.currentPeriod ? `${featuredMatch.basketballScore.currentPeriod} • ${featuredMatch.basketballScore.gameClock || 'LIVE'}` : 'LIVE')}
                    {featuredMatch.sportType === 'FOOTBALL' && `${featuredMatch.footballScore?.currentHalf || '1ST HALF'} • ${featuredMatch.footballScore?.matchMinutes ?? 0}'`}
                    {featuredMatch.sportType === 'CRICKET' && `LIVE • INN ${featuredMatch.cricketScore?.currentInning || 1}`}
                  </span>
                </div>
              ) : (
                <span className="px-2.5 py-1 rounded bg-[#252a37] text-[#8c909f] font-mono text-xs font-semibold uppercase">
                  {featuredMatch.status}
                </span>
              )}
            </div>

            {/* Scoreboard Display Box */}
            <div className="space-y-3 bg-[#090e1a] border border-[#1a1f2c] rounded-lg p-3.5 sm:p-4">
              {/* Team 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-xs flex-shrink-0 shadow">
                    {featuredMatch.team1?.name?.substring(0, 2).toUpperCase() || 'T1'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-body-md text-sm sm:text-base font-bold text-[#dee2f4] truncate">
                        {featuredMatch.team1?.name}
                      </span>
                      {featuredMatch.sportType === 'BASKETBALL' && featuredMatch.basketballScore?.possessionTeamId === featuredMatch.team1Id && (
                        <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]" title="In Possession">sports_basketball</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-label-sm text-[11px] text-[#8c909f]">
                      {featuredMatch.sportType === 'BASKETBALL' && (
                        <>
                          <span>Fouls: {featuredMatch.basketballScore?.team1Fouls ?? 0}</span>
                          <span>•</span>
                          <span className={featuredMatch.basketballScore?.team1Bonus ? 'text-[#4edea3]' : ''}>
                            {featuredMatch.basketballScore?.team1Bonus ? 'Bonus Active' : 'Regular'}
                          </span>
                        </>
                      )}
                      {featuredMatch.sportType === 'CRICKET' && (
                        <span>Overs: {formatCricketOvers(featuredMatch.cricketScore?.team1Balls ?? 0)}</span>
                      )}
                      {featuredMatch.sportType === 'FOOTBALL' && (
                        <span>Fouls: {featuredMatch.footballScore?.team1Fouls ?? 0}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-score-display text-2xl sm:text-3xl text-white font-bold tabular-nums">
                    {featuredMatch.sportType === 'BASKETBALL' && (featuredMatch.basketballScore?.team1Score ?? 0)}
                    {featuredMatch.sportType === 'FOOTBALL' && (featuredMatch.footballScore?.team1Goals ?? 0)}
                    {featuredMatch.sportType === 'CRICKET' && `${featuredMatch.cricketScore?.team1Runs ?? 0}/${featuredMatch.cricketScore?.team1Wickets ?? 0}`}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#1a1f2c]"></div>

              {/* Team 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#252a37] text-[#c2c6d6] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {featuredMatch.team2?.name?.substring(0, 2).toUpperCase() || 'T2'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-body-md text-sm sm:text-base font-semibold text-[#c2c6d6] truncate">
                        {featuredMatch.team2?.name}
                      </span>
                      {featuredMatch.sportType === 'BASKETBALL' && featuredMatch.basketballScore?.possessionTeamId === featuredMatch.team2Id && (
                        <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]" title="In Possession">sports_basketball</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-label-sm text-[11px] text-[#8c909f]">
                      {featuredMatch.sportType === 'BASKETBALL' && (
                        <>
                          <span>Fouls: {featuredMatch.basketballScore?.team2Fouls ?? 0}</span>
                          <span>•</span>
                          <span className={featuredMatch.basketballScore?.team2Bonus ? 'text-[#4edea3]' : ''}>
                            {featuredMatch.basketballScore?.team2Bonus ? 'Bonus Active' : 'Regular'}
                          </span>
                        </>
                      )}
                      {featuredMatch.sportType === 'CRICKET' && (
                        <span>Overs: {formatCricketOvers(featuredMatch.cricketScore?.team2Balls ?? 0)}</span>
                      )}
                      {featuredMatch.sportType === 'FOOTBALL' && (
                        <span>Fouls: {featuredMatch.footballScore?.team2Fouls ?? 0}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-score-display text-2xl sm:text-3xl text-[#c2c6d6] font-bold tabular-nums">
                    {featuredMatch.sportType === 'BASKETBALL' && (featuredMatch.basketballScore?.team2Score ?? 0)}
                    {featuredMatch.sportType === 'FOOTBALL' && (featuredMatch.footballScore?.team2Goals ?? 0)}
                    {featuredMatch.sportType === 'CRICKET' && `${featuredMatch.cricketScore?.team2Runs ?? 0}/${featuredMatch.cricketScore?.team2Wickets ?? 0}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Action & Mini Telemetry Footnote */}
            <div className="flex items-center justify-between pt-3.5">
              <div className="flex items-center gap-2 text-[#8c909f] font-body-sm text-xs">
                <span className="material-symbols-outlined text-[16px] text-[#4edea3]">bolt</span>
                <span>Live telemetry via Socket.IO gateway</span>
              </div>
              <Link
                to={`/matches/${featuredMatch.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#4d8eff] text-[#00285d] font-label-sm text-xs font-bold active:scale-95 transition-transform"
              >
                <span>Open Console</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. SIMULTANEOUS FIXTURES CARDS (Stitch Exact Multi-Sport Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-base sm:text-lg text-[#dee2f4] font-bold">
            Simultaneous Fixtures
          </h2>
          <Link to="/scoreboard" className="font-label-sm text-xs text-[#4cd7f6] font-semibold hover:underline">
            View All ({countAll}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {secondaryMatches.map((match) => (
            <div
              key={match.id}
              className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-4 space-y-3 shadow hover:bg-[#252a37]/80 transition-colors"
            >
              {/* Fixture Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-[#252a37] text-[#4cd7f6] font-label-sm text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[13px]">
                      {match.sportType === 'CRICKET' ? 'sports_cricket' : match.sportType === 'BASKETBALL' ? 'sports_basketball' : 'sports_soccer'}
                    </span>
                    <span className="truncate">{match.tournament?.name || match.sportType}</span>
                  </span>
                  <span className="font-label-sm text-[11px] text-[#8c909f] truncate">
                    {match.venue || 'Pitch/Court'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="font-stat-mono text-[11px] font-bold">
                    {match.status === 'LIVE' ? 'LIVE' : match.status}
                  </span>
                </div>
              </div>

              {/* Match Score Rows */}
              {match.sportType === 'CRICKET' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#252a37] flex items-center justify-center text-[10px] text-[#c2c6d6] font-bold">
                        {match.team1?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#c2c6d6]">{match.team1?.name}</span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm text-[#c2c6d6] tabular-nums font-semibold">
                      {match.cricketScore?.team1Runs ?? 0}/{match.cricketScore?.team1Wickets ?? 0}{' '}
                      <span className="text-xs text-[#8c909f]">({formatCricketOvers(match.cricketScore?.team1Balls ?? 0)})</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#4d8eff] flex items-center justify-center text-[10px] text-[#00285d] font-bold">
                        {match.team2?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#dee2f4]">{match.team2?.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" title="Batting Now"></span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm text-white font-bold tabular-nums">
                      {match.cricketScore?.team2Runs ?? 0}/{match.cricketScore?.team2Wickets ?? 0}{' '}
                      <span className="text-xs text-[#4cd7f6]">({formatCricketOvers(match.cricketScore?.team2Balls ?? 0)})</span>
                    </span>
                  </div>

                  {/* Target equation pill */}
                  <div className="flex items-center justify-between p-2 rounded bg-[#090e1a] border border-[#1a1f2c] text-[#dee2f4] text-[11px]">
                    <span className="text-[#8c909f]">RR: {calculateRunRate(match.cricketScore?.team2Runs ?? 0, match.cricketScore?.team2Balls ?? 0)}</span>
                    <Link to={`/matches/${match.id}`} className="text-[#4cd7f6] font-semibold hover:underline">
                      Live Ball-by-Ball →
                    </Link>
                  </div>
                </div>
              )}

              {match.sportType === 'FOOTBALL' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-xs sm:text-sm font-bold text-[#dee2f4] truncate block">{match.team1?.name}</span>
                      <span className="text-[10px] text-[#4edea3]">Fouls: {match.footballScore?.team1Fouls ?? 0}</span>
                    </div>
                    <div className="px-3.5 py-1 rounded bg-[#090e1a] border border-[#1a1f2c] flex items-center gap-2">
                      <span className="text-lg font-bold text-white tabular-nums">{match.footballScore?.team1Goals ?? 0}</span>
                      <span className="text-[#8c909f] text-xs">-</span>
                      <span className="text-lg font-bold text-[#c2c6d6] tabular-nums">{match.footballScore?.team2Goals ?? 0}</span>
                    </div>
                    <div className="flex-1 min-w-0 pl-2 text-right">
                      <span className="text-xs sm:text-sm font-semibold text-[#c2c6d6] truncate block">{match.team2?.name}</span>
                      <span className="text-[10px] text-[#8c909f]">Fouls: {match.footballScore?.team2Fouls ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#8c909f] border-t border-[#252a37]">
                    <span>Half: {match.footballScore?.currentHalf || '1st'}</span>
                    <Link to={`/matches/${match.id}`} className="text-[#4cd7f6] font-semibold hover:underline">
                      Match Center →
                    </Link>
                  </div>
                </div>
              )}

              {match.sportType === 'BASKETBALL' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-xs sm:text-sm font-bold text-[#dee2f4] truncate block">{match.team1?.name}</span>
                      <span className="text-[10px] text-[#8c909f]">Fouls: {match.basketballScore?.team1Fouls ?? 0}</span>
                    </div>
                    <div className="px-3.5 py-1 rounded bg-[#090e1a] border border-[#1a1f2c] flex items-center gap-2">
                      <span className="text-lg font-bold text-white tabular-nums">{match.basketballScore?.team1Score ?? 0}</span>
                      <span className="text-[#8c909f] text-xs">-</span>
                      <span className="text-lg font-bold text-[#c2c6d6] tabular-nums">{match.basketballScore?.team2Score ?? 0}</span>
                    </div>
                    <div className="flex-1 min-w-0 pl-2 text-right">
                      <span className="text-xs sm:text-sm font-semibold text-[#c2c6d6] truncate block">{match.team2?.name}</span>
                      <span className="text-[10px] text-[#8c909f]">Fouls: {match.basketballScore?.team2Fouls ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#8c909f] border-t border-[#252a37]">
                    <span>Period: {match.basketballScore?.currentPeriod || 'Q1'}</span>
                    <Link to={`/matches/${match.id}`} className="text-[#4cd7f6] font-semibold hover:underline">
                      Box Score →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. MULTI-SPORT ARCHITECTURE: TAILORED SCORING ENGINES (Stitch Bento Cards) */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col">
          <span className="font-label-sm text-xs text-[#4cd7f6] uppercase tracking-wider font-semibold">
            Multi-Sport Architecture
          </span>
          <h2 className="font-headline-sm text-lg sm:text-xl text-[#dee2f4] font-bold">
            Tailored Scoring Engines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Cricket Card */}
          <div className="p-4 rounded-xl bg-[#161b28] border border-[#252a37] flex gap-3.5 items-start shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#252a37] flex items-center justify-center text-[#4cd7f6] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">sports_cricket</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-sm text-[#dee2f4] font-bold">Cricket Ball-by-Ball</span>
                <span className="px-1.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-label-sm text-[10px] font-bold">
                  DLS Ready
                </span>
              </div>
              <p className="font-body-sm text-xs text-[#8c909f] leading-relaxed">
                Runs, wickets, extras (wides, no-balls), legal ball counters, run-rate tracking, and automated target chasing.
              </p>
            </div>
          </div>

          {/* Football Card */}
          <div className="p-4 rounded-xl bg-[#161b28] border border-[#252a37] flex gap-3.5 items-start shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#252a37] flex items-center justify-center text-[#4cd7f6] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">timer</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-sm text-[#dee2f4] font-bold">Match Clock & Stoppage</span>
                <span className="px-1.5 py-0.5 rounded bg-[#4cd7f6]/20 text-[#4cd7f6] font-label-sm text-[10px] font-bold">
                  VAR Log
                </span>
              </div>
              <p className="font-body-sm text-xs text-[#8c909f] leading-relaxed">
                Dynamic game clock, stoppage minutes, yellow/red disciplinary sanctions, and referee timeline synchronization.
              </p>
            </div>
          </div>

          {/* Basketball Card */}
          <div className="p-4 rounded-xl bg-[#161b28] border border-[#252a37] flex gap-3.5 items-start shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#252a37] flex items-center justify-center text-[#4cd7f6] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">sports_basketball</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-sm text-[#dee2f4] font-bold">FIBA/NCAA Fouls & Clocks</span>
                <span className="px-1.5 py-0.5 rounded bg-[#4d8eff]/20 text-[#adc6ff] font-label-sm text-[10px] font-bold">
                  24s Shot Clock
                </span>
              </div>
              <p className="font-body-sm text-xs text-[#8c909f] leading-relaxed">
                1PT, 2PT, 3PT field goal toggles, quarter splits, team foul accumulation, bonus free-throw triggers, and possession arrows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TOURNAMENT OS: BUILT FOR SIDELINE REFEREES & ADMINS (Stitch 2x2 Grid) */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col">
          <span className="font-label-sm text-xs text-[#4cd7f6] uppercase tracking-wider font-semibold">
            Tournament OS
          </span>
          <h2 className="font-headline-sm text-lg sm:text-xl text-[#dee2f4] font-bold">
            Built for Sideline Referees & Admins
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Feature 1 */}
          <div className="p-3.5 rounded-lg bg-[#1a1f2c] border border-[#252a37] flex flex-col space-y-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[24px]">admin_panel_settings</span>
            <span className="font-label-md text-xs sm:text-sm text-[#dee2f4] font-bold">Role-Based Access</span>
            <span className="font-body-sm text-[11px] text-[#8c909f] leading-tight">
              Strict permissions for Admin, Scorer, and Viewer with JWT tokens.
            </span>
          </div>

          {/* Feature 2 */}
          <div className="p-3.5 rounded-lg bg-[#1a1f2c] border border-[#252a37] flex flex-col space-y-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[24px]">electric_bolt</span>
            <span className="font-label-md text-xs sm:text-sm text-[#dee2f4] font-bold">Zero-Latency WebSockets</span>
            <span className="font-body-sm text-[11px] text-[#8c909f] leading-tight">
              Instant score broadcast across phones, jumbotrons, and live desks.
            </span>
          </div>

          {/* Feature 3 */}
          <div className="p-3.5 rounded-lg bg-[#1a1f2c] border border-[#252a37] flex flex-col space-y-2">
            <span className="material-symbols-outlined text-[#adc6ff] text-[24px]">leaderboard</span>
            <span className="font-label-md text-xs sm:text-sm text-[#dee2f4] font-bold">Auto Standings</span>
            <span className="font-body-sm text-[11px] text-[#8c909f] leading-tight">
              Net Run Rate, Goal Difference, and points recalculated instantly on match conclusion.
            </span>
          </div>

          {/* Feature 4 */}
          <div className="p-3.5 rounded-lg bg-[#1a1f2c] border border-[#252a37] flex flex-col space-y-2">
            <span className="material-symbols-outlined text-red-400 text-[24px]">history</span>
            <span className="font-label-md text-xs sm:text-sm text-[#dee2f4] font-bold">Instant Scorer Undo</span>
            <span className="font-body-sm text-[11px] text-[#8c909f] leading-tight">
              Undo accidental touches with full state history rollback.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
