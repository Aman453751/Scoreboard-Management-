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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-amber-500 animate-pulse" />
            <span>Official Scorer Workstation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-white">{user?.name}</strong>. Start fixtures, record real-time events, and finalize results.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['ALL', 'MY_MATCHES', 'LIVE', 'UPCOMING'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards for Scoring */}
      {filteredMatches.length === 0 ? (
        <div className="p-12 rounded-3xl bg-navy-900 border border-slate-800 text-center">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No matches found</h3>
          <p className="text-xs text-slate-400 mt-1">
            No fixtures match your current filter selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((m) => (
            <div
              key={m.id}
              className={`p-6 rounded-2xl bg-navy-900 border transition-all ${
                m.status === 'LIVE'
                  ? 'border-blue-500/40 bg-gradient-to-br from-navy-900 to-blue-950/20 shadow-xl shadow-blue-500/5'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                  {m.sportType}
                </span>
                <div className="flex items-center gap-2">
                  {m.status === 'LIVE' ? (
                    <LiveBadge />
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400">
                      {m.status}
                    </span>
                  )}
                  {m.scorerId === user?.id && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Assigned to You
                    </span>
                  )}
                </div>
              </div>

              {/* Tournament & Venue */}
              <div className="my-3 text-xs text-slate-400">
                <p className="font-semibold text-slate-300 truncate">{m.tournament?.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{m.venue}</p>
              </div>

              {/* Team Scores Display */}
              <div className="space-y-3 py-2">
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
                      ? `${m.score.teamAGoals}`
                      : m.sportType === 'BASKETBALL' && m.score
                      ? `${m.score.teamAPoints}`
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
                      ? `${m.score.teamBGoals}`
                      : m.sportType === 'BASKETBALL' && m.score
                      ? `${m.score.teamBPoints}`
                      : '-'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {m.status === 'UPCOMING' && (
                    <button
                      onClick={() => handleStatusChange(m.id, 'LIVE')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Match (Go LIVE)</span>
                    </button>
                  )}

                  {m.status === 'LIVE' && (
                    <button
                      onClick={() => handleStatusChange(m.id, 'COMPLETED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Final / End Match</span>
                    </button>
                  )}
                </div>

                <Link
                  to={`/scoreboard/${m.id}?mode=scorer`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
                >
                  <span>Open Scorer Console</span>
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

export default ScorerDashboard;
