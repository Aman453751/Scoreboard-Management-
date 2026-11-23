import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { scoreService } from '../services/scoreService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import CricketScoreboard from '../components/cricket/CricketScoreboard';
import CricketScorerControl from '../components/cricket/CricketScorerControl';
import FootballScoreboard from '../components/football/FootballScoreboard';
import FootballScorerControl from '../components/football/FootballScorerControl';
import BasketballScoreboard from '../components/basketball/BasketballScoreboard';
import BasketballScorerControl from '../components/basketball/BasketballScorerControl';
import LiveBadge from '../components/common/LiveBadge';
import {
  Radio,
  Sliders,
  Eye,
  Calendar,
  Activity,
  ArrowLeft,
  RotateCw,
  Trophy,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { formatCricketOvers } from '../utils/formatters';

const LiveScoreboardPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { socket, isConnected } = useSocket();
  const { user, isAdmin } = useAuth();

  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [score, setScore] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('ALL');

  // If URL has ?mode=scorer or user clicks toggle
  const initialMode = searchParams.get('mode') === 'scorer' ? 'scorer' : 'viewer';
  const [mode, setMode] = useState(initialMode);

  // Load all matches
  const loadMatchesList = async () => {
    try {
      const res = await matchService.getAll();
      if (res.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load specific match and score
  const loadMatchDetails = async (matchId) => {
    setLoading(true);
    try {
      const [matchRes, scoreRes] = await Promise.all([
        matchService.getById(matchId),
        scoreService.getScore(matchId)
      ]);

      if (matchRes.success) setCurrentMatch(matchRes.data.match);
      if (scoreRes.success) {
        setScore(scoreRes.data.score);
        setEvents(scoreRes.data.events || []);
      }
    } catch (err) {
      console.error('Error fetching live match data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadMatchDetails(id);
    } else {
      loadMatchesList();
    }
  }, [id]);

  // Socket.IO real-time event subscriptions
  useEffect(() => {
    if (!socket) return;

    if (id) {
      socket.emit('join_match', id);

      const handleScoreUpdated = (data) => {
        if (data.score) {
          setScore(data.score);
        }
        if (data.event) {
          setEvents((prev) => [data.event, ...prev.filter((e) => e.id !== data.event.id)]);
        }
      };

      const handleMatchUpdated = (updatedMatch) => {
        setCurrentMatch((prev) => ({ ...prev, ...updatedMatch }));
      };

      const handleEventDeleted = ({ eventId }) => {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      };

      socket.on('score_updated', handleScoreUpdated);
      socket.on('match_updated', handleMatchUpdated);
      socket.on('event_deleted', handleEventDeleted);

      return () => {
        socket.emit('leave_match', id);
        socket.off('score_updated', handleScoreUpdated);
        socket.off('match_updated', handleMatchUpdated);
        socket.off('event_deleted', handleEventDeleted);
      };
    } else {
      const handleGlobalRefresh = () => {
        loadMatchesList();
      };
      socket.on('global_score_update', handleGlobalRefresh);
      socket.on('live_matches_refresh', handleGlobalRefresh);

      return () => {
        socket.off('global_score_update', handleGlobalRefresh);
        socket.off('live_matches_refresh', handleGlobalRefresh);
      };
    }
  }, [socket, id]);

  const canScore = isAdmin || (user?.role === 'SCORER' && (currentMatch?.scorerId === user?.id || !currentMatch?.scorerId));

  const toggleMode = (newMode) => {
    setMode(newMode);
    setSearchParams(newMode === 'scorer' ? { mode: 'scorer' } : {});
  };

  // If no match ID selected, display the Live Matches Hub
  if (!id) {
    const liveList = matches.filter((m) => m.status === 'LIVE');
    const upcomingList = matches.filter((m) => m.status === 'UPCOMING');

    const filteredLive = liveList.filter((m) => {
      if (selectedSport === 'ALL') return true;
      return m.sportType === selectedSport;
    });

    const filteredUpcoming = upcomingList.filter((m) => {
      if (selectedSport === 'ALL') return true;
      return m.sportType === selectedSport;
    });

    return (
      <div className="space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span>Live Scores Dashboard</span>
            </h1>
            <p className="text-xs text-[#8c909f] mt-1">
              Zero-latency scoreboard console synchronized across university athletic grounds
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1f2c] border border-[#252a37] font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#4edea3] animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-[#dee2f4]">{isConnected ? 'SOCKET.IO LIVE' : 'CONNECTING...'}</span>
          </div>
        </div>

        {/* Sport Filters Ribbon (Stitch Exact) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedSport('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all ${
              selectedSport === 'ALL'
                ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                : 'bg-[#1a1f2c] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sports</span>
            <span>All Sports</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ml-0.5 ${selectedSport === 'ALL' ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#c2c6d6]'}`}>
              {matches.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedSport('BASKETBALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all ${
              selectedSport === 'BASKETBALL'
                ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                : 'bg-[#1a1f2c] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sports_basketball</span>
            <span>Basketball</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ml-0.5 ${selectedSport === 'BASKETBALL' ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#c2c6d6]'}`}>
              {matches.filter(m => m.sportType === 'BASKETBALL').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedSport('CRICKET')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all ${
              selectedSport === 'CRICKET'
                ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                : 'bg-[#1a1f2c] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sports_cricket</span>
            <span>Cricket</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ml-0.5 ${selectedSport === 'CRICKET' ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#c2c6d6]'}`}>
              {matches.filter(m => m.sportType === 'CRICKET').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedSport('FOOTBALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-sm text-xs font-semibold transition-all ${
              selectedSport === 'FOOTBALL'
                ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                : 'bg-[#1a1f2c] text-[#c2c6d6] hover:bg-[#252a37]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">sports_soccer</span>
            <span>Football</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ml-0.5 ${selectedSport === 'FOOTBALL' ? 'bg-[#00285d]/30 text-white' : 'bg-[#252a37] text-[#c2c6d6]'}`}>
              {matches.filter(m => m.sportType === 'FOOTBALL').length}
            </span>
          </button>
        </div>

        {/* Active Live Matches Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LiveBadge />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Active Contests</h2>
          </div>

          {filteredLive.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#1a1f2c] border border-[#252a37] text-center">
              <Activity className="w-8 h-8 text-[#8c909f] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#dee2f4]">No live matches currently in progress for this category</p>
              <p className="text-xs text-[#8c909f] mt-1">Select an upcoming match below to preview fixture details</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLive.map((m) => {
                const team1 = m.team1 || m.teamA;
                const team2 = m.team2 || m.teamB;

                return (
                  <Link
                    key={m.id}
                    to={`/scoreboard/${m.id}`}
                    className="group rounded-xl bg-[#1a1f2c] border border-[#252a37] hover:border-[#4d8eff]/60 p-4 sm:p-5 flex flex-col justify-between shadow-lg transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase tracking-wider">
                          {m.sportType}
                        </span>
                        <LiveBadge />
                      </div>

                      <p className="text-xs text-[#8c909f] truncate mb-3">{m.tournament?.name || 'Championship Series'}</p>

                      <div className="space-y-2.5 py-1 bg-[#090e1a] border border-[#1a1f2c] p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-[10px] shrink-0">
                              {team1?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#4cd7f6] transition-colors truncate">
                              {team1?.name}
                            </span>
                          </div>
                          <span className="font-score-display text-base sm:text-lg font-bold text-white font-mono tabular-nums">
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
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-[#252a37] text-[#c2c6d6] flex items-center justify-center font-bold text-[10px] shrink-0">
                              {team2?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-[#c2c6d6] group-hover:text-[#4cd7f6] transition-colors truncate">
                              {team2?.name}
                            </span>
                          </div>
                          <span className="font-score-display text-base sm:text-lg font-bold text-[#c2c6d6] font-mono tabular-nums">
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

                    <div className="pt-3 mt-3 border-t border-[#252a37] flex items-center justify-between text-xs text-[#8c909f]">
                      <span className="truncate">{m.venue || 'Main Court'}</span>
                      <span className="font-bold text-[#4cd7f6] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Enter Console</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Fixtures */}
        <div className="space-y-3 pt-4 border-t border-[#252a37]">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4cd7f6]" />
            <span>Upcoming Fixtures</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredUpcoming.map((m) => {
              const team1 = m.team1 || m.teamA;
              const team2 = m.team2 || m.teamB;

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-[#1a1f2c] border border-[#252a37] flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#4cd7f6] font-bold text-[10px] uppercase">{m.sportType}</span>
                    <span className="text-[#8c909f]">{new Date(m.matchDate).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {team1?.name} <span className="text-[#8c909f] font-normal">vs</span> {team2?.name}
                  </h4>
                  <div className="flex items-center justify-between pt-2 border-t border-[#252a37] text-xs text-[#8c909f]">
                    <span className="truncate">{m.venue || 'TBD'}</span>
                    <Link
                      to={`/scoreboard/${m.id}`}
                      className="text-[#4cd7f6] hover:underline font-semibold"
                    >
                      Fixture Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Specific Match Detail View ---
  if (loading) {
    return (
      <div className="text-center py-20 text-[#8c909f] text-xs font-mono">
        Loading live scoreboard telemetry...
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="text-center py-20 text-[#8c909f] text-sm">
        <p>Match not found.</p>
        <Link to="/scoreboard" className="mt-4 inline-block text-[#4cd7f6] font-semibold">
          ← Back to Live Center
        </Link>
      </div>
    );
  }

  const team1 = currentMatch.team1 || currentMatch.teamA;
  const team2 = currentMatch.team2 || currentMatch.teamB;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Mode Switcher (Stitch Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div className="flex items-center gap-3">
          <Link
            to="/scoreboard"
            className="p-2 rounded bg-[#1a1f2c] hover:bg-[#252a37] text-[#c2c6d6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{team1?.name}</span>
              <span className="text-[#8c909f] font-normal text-sm">vs</span>
              <span>{team2?.name}</span>
            </h1>
            <p className="text-xs text-[#8c909f] mt-0.5">
              {currentMatch.tournament?.name} • {currentMatch.venue}
            </p>
          </div>
        </div>

        {/* View Mode Toggle (Viewer vs Scorer) */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1a1f2c] border border-[#252a37] font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#4edea3] animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-[#dee2f4]">{isConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
          </div>

          {canScore && (
            <div className="flex items-center p-1 rounded bg-[#1a1f2c] border border-[#252a37]">
              <button
                onClick={() => toggleMode('viewer')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  mode === 'viewer'
                    ? 'bg-[#4d8eff] text-[#00285d] shadow-sm'
                    : 'text-[#c2c6d6] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Viewer</span>
              </button>
              <button
                onClick={() => toggleMode('scorer')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  mode === 'scorer'
                    ? 'bg-[#3b82f6] text-white shadow-sm'
                    : 'text-[#c2c6d6] hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Scorer Console</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scorer Controls Panel (Shown only in scorer mode for authorized users) */}
      {canScore && mode === 'scorer' && (
        <div className="animate-slide-up">
          {currentMatch.sportType === 'CRICKET' && (
            <CricketScorerControl
              match={currentMatch}
              score={score}
              onScoreUpdated={(newScore) => setScore(newScore)}
            />
          )}

          {currentMatch.sportType === 'FOOTBALL' && (
            <FootballScorerControl
              match={currentMatch}
              score={score}
              onScoreUpdated={(newScore) => setScore(newScore)}
            />
          )}

          {currentMatch.sportType === 'BASKETBALL' && (
            <BasketballScorerControl
              match={currentMatch}
              score={score}
              onScoreUpdated={(newScore) => setScore(newScore)}
            />
          )}
        </div>
      )}

      {/* Main Scoreboard Display Component */}
      {currentMatch.sportType === 'CRICKET' && (
        <CricketScoreboard
          match={currentMatch}
          score={score}
          events={events}
        />
      )}

      {currentMatch.sportType === 'FOOTBALL' && (
        <FootballScoreboard
          match={currentMatch}
          score={score}
          events={events}
        />
      )}

      {currentMatch.sportType === 'BASKETBALL' && (
        <BasketballScoreboard
          match={currentMatch}
          score={score}
          events={events}
        />
      )}
    </div>
  );
};

export default LiveScoreboardPage;
