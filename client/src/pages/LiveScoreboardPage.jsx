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
  CheckCircle2
} from 'lucide-react';

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

  // If URL has ?mode=scorer or user clicks toggle
  const initialMode = searchParams.get('mode') === 'scorer' ? 'scorer' : 'viewer';
  const [mode, setMode] = useState(initialMode);

  // Load all live matches if on root /scoreboard
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
    if (!socket || !id) return;

    // Join room for this specific match
    socket.emit('join_match', id);
    console.log(`📡 Subscribed to match_${id} live channel`);

    const handleScoreUpdated = (data) => {
      console.log('⚡ Real-time score update received:', data);
      if (data.score) {
        setScore(data.score);
      }
      if (data.event) {
        setEvents((prev) => [data.event, ...prev.filter((e) => e.id !== data.event.id)]);
      }
    };

    const handleMatchUpdated = (updatedMatch) => {
      console.log('⚡ Match state updated:', updatedMatch);
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

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
              <span>Live Scoreboard Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select any live match below to open its zero-latency broadcast
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            <span className="text-slate-300">{isConnected ? 'SOCKET.IO CONNECTED' : 'CONNECTING...'}</span>
          </div>
        </div>

        {/* Active Live Matches */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LiveBadge />
            <h2 className="text-lg font-bold text-white tracking-tight">Active Contests</h2>
          </div>

          {liveList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-navy-900 border border-slate-800 text-center">
              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No matches currently in progress</p>
              <p className="text-xs text-slate-500 mt-1">Select an upcoming match to view fixture details</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveList.map((m) => (
                <Link
                  key={m.id}
                  to={`/scoreboard/${m.id}`}
                  className="group rounded-2xl bg-navy-900 border border-slate-800 hover:border-blue-500/50 p-6 flex flex-col justify-between shadow-xl transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-amber-400">
                        {m.sportType}
                      </span>
                      <LiveBadge />
                    </div>

                    <p className="text-xs text-slate-400 truncate mb-4">{m.tournament?.name}</p>

                    <div className="space-y-3 py-1">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                          {m.teamA.name}
                        </span>
                        <span className="text-xl font-mono font-black text-white">
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
                        <span className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                          {m.teamB.name}
                        </span>
                        <span className="text-xl font-mono font-black text-white">
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

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate">{m.venue}</span>
                    <span className="font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                      Enter Arena →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Fixtures */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Upcoming Fixtures</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingList.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-400 font-bold">{m.sportType}</span>
                  <span className="text-slate-400">{new Date(m.matchDate).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-white text-sm">
                  {m.teamA.name} <span className="text-slate-500 font-normal">vs</span> {m.teamB.name}
                </h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span className="truncate">{m.venue}</span>
                  <Link
                    to={`/scoreboard/${m.id}`}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Specific Match Detail View ---
  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-xs">Loading scoreboard...</div>;
  }

  if (!currentMatch) {
    return (
      <div className="text-center py-20 text-slate-400 text-sm">
        <p>Match not found.</p>
        <Link to="/scoreboard" className="mt-4 inline-block text-blue-400 font-semibold">
          ← Back to Live Center
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/scoreboard"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{currentMatch.teamA.name}</span>
              <span className="text-slate-500 font-normal text-base">vs</span>
              <span>{currentMatch.teamB.name}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentMatch.tournament?.name} • {currentMatch.venue}
            </p>
          </div>
        </div>

        {/* View Mode Toggle (Viewer vs Scorer) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 font-mono text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            <span className="text-slate-300">{isConnected ? 'LIVE SYNC' : 'CONNECTING'}</span>
          </div>

          {canScore && (
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => toggleMode('viewer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'viewer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Viewer</span>
              </button>
              <button
                onClick={() => toggleMode('scorer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'scorer'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
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
