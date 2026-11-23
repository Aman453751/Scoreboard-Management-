import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../services/statsService';
import { matchService } from '../services/matchService';
import {
  Trophy,
  Users,
  Calendar,
  Radio,
  CheckCircle,
  Clock,
  Plus,
  ArrowUpRight,
  Activity,
  Flame,
  ShieldCheck
} from 'lucide-react';
import LiveBadge from '../components/common/LiveBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [liveMatches, setLiveMatches] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await statsService.getDashboardStats();
      if (res.success) {
        setStats(res.data.counts);
        setLiveMatches(res.data.liveMatches || []);
        setRecentEvents(res.data.recentEvents || []);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized management for tournaments, teams, schedules, and scores
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/tournaments?action=new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Tournament</span>
          </Link>
          <Link
            to="/teams?action=new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Team</span>
          </Link>
          <Link
            to="/matches?action=new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Match</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tournaments</span>
            <Trophy className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white font-mono">{stats?.totalTournaments ?? 0}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Active & Completed</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Teams</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white font-mono">{stats?.totalTeams ?? 0}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Collegiate Squads</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Matches</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white font-mono">{stats?.totalMatches ?? 0}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Scheduled Fixtures</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-rose-500/20 bg-rose-500/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold">Live Now</span>
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-400 font-mono">{stats?.liveMatches ?? 0}</span>
            <p className="text-[10px] text-rose-300/70 mt-0.5">Active Scoreboards</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-400 font-mono">{stats?.completedMatches ?? 0}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Finalized Matches</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Upcoming</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-400 font-mono">{stats?.upcomingMatches ?? 0}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Pending Fixtures</p>
          </div>
        </div>
      </div>

      {/* Live Matches In Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LiveBadge />
            <h3 className="text-lg font-bold text-white tracking-tight">Active Live Matches</h3>
          </div>
          <Link to="/scoreboard" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
            <span>Live Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {liveMatches.length === 0 ? (
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 text-center text-xs text-slate-500">
            No matches currently LIVE. Start a scheduled match from the Match Schedule page.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-navy-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-400">{m.sportType}</span>
                  <span className="text-slate-400 font-mono">{m.currentPeriod || 'In Progress'}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white truncate max-w-[150px]">{m.teamA.name}</span>
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
                    <span className="text-sm font-bold text-white truncate max-w-[150px]">{m.teamB.name}</span>
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

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 truncate max-w-[120px]">{m.venue}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/scoreboard/${m.id}?mode=scorer`}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold hover:bg-blue-600/30"
                    >
                      Score Console
                    </Link>
                    <Link
                      to={`/scoreboard/${m.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium hover:text-white"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Timeline & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Recent Match Activity & Scoring Logs</span>
          </h3>

          {recentEvents.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No recent match scoring events recorded.</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-850/70 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">
                      {evt.match?.teamA?.name} vs {evt.match?.teamB?.name}
                    </span>
                    <p className="text-slate-300 mt-0.5">{evt.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Management Shortcuts</h3>
          <div className="space-y-2">
            <Link
              to="/tournaments"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-white">Manage Tournaments</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <Link
              to="/teams"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Manage Teams & Players</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <Link
              to="/matches"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Schedule Fixtures</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <Link
              to="/dashboard/users"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">User Roles & Scorers</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
