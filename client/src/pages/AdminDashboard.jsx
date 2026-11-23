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
  ShieldCheck,
  UserCheck
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
    <div className="space-y-6">
      {/* Top Banner (Stitch Dashboard Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#252a37]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#4cd7f6]" />
            <span>Administrator Operations Console</span>
          </h1>
          <p className="text-xs text-[#8c909f] mt-1">
            Centralized platform control for tournaments, teams, scheduling, and live telemetry
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/tournaments?action=new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tournament</span>
          </Link>
          <Link
            to="/teams?action=new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#252a37] hover:bg-[#343947] text-white text-xs font-semibold active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span>Team</span>
          </Link>
          <Link
            to="/matches?action=new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#252a37] hover:bg-[#343947] text-white text-xs font-semibold active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>Fixture</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1f2c] border border-[#252a37] hover:bg-[#252a37] text-[#c2c6d6] text-xs font-semibold"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#adc6ff]" />
            <span>Users</span>
          </Link>
        </div>
      </div>

      {/* Main Telemetry Stats Grid (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#1a1f2c] border border-[#252a37] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c909f]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tournaments</span>
            <Trophy className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="mt-2">
            <span className="font-stat-mono text-2xl font-bold text-white font-mono tabular-nums">{stats?.totalTournaments ?? 0}</span>
            <p className="text-[10px] text-[#8c909f] mt-0.5">Active & Staged</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a1f2c] border border-[#252a37] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c909f]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Teams</span>
            <Users className="w-4 h-4 text-[#adc6ff]" />
          </div>
          <div className="mt-2">
            <span className="font-stat-mono text-2xl font-bold text-white font-mono tabular-nums">{stats?.totalTeams ?? 0}</span>
            <p className="text-[10px] text-[#8c909f] mt-0.5">Rosters Registered</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a1f2c] border border-[#252a37] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c909f]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Matches</span>
            <Calendar className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="mt-2">
            <span className="font-stat-mono text-2xl font-bold text-white font-mono tabular-nums">{stats?.totalMatches ?? 0}</span>
            <p className="text-[10px] text-[#8c909f] mt-0.5">Campus Fixtures</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a1f2c] border border-red-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Contests</span>
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="mt-2">
            <span className="font-stat-mono text-2xl font-bold text-red-400 font-mono tabular-nums flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {stats?.liveMatches ?? 0}
            </span>
            <p className="text-[10px] text-red-400/80 mt-0.5">Active Broadcasts</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a1f2c] border border-[#252a37] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c909f]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="mt-2">
            <span className="font-stat-mono text-2xl font-bold text-[#4edea3] font-mono tabular-nums">{stats?.completedMatches ?? 0}</span>
            <p className="text-[10px] text-[#8c909f] mt-0.5">Final Results</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a1f2c] border border-[#252a37] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c909f]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Upcoming</span>
            <Clock className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="mt-2">
            <span className="font-stat-mono text-2xl font-bold text-[#4cd7f6] font-mono tabular-nums">{stats?.upcomingMatches ?? 0}</span>
            <p className="text-[10px] text-[#8c909f] mt-0.5">On Schedule</p>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Active Live Games & Real-Time Event Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Live Games Column */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Live Sideline Scoreboards</span>
            </h2>
            <Link to="/scoreboard" className="text-xs text-[#4cd7f6] hover:underline font-semibold">
              View All →
            </Link>
          </div>

          {liveMatches.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#1a1f2c] border border-[#252a37] text-center text-xs text-[#8c909f]">
              No matches currently in progress. Start a scheduled match to stream live telemetry.
            </div>
          ) : (
            <div className="space-y-3">
              {liveMatches.map((m) => {
                const team1 = m.team1 || m.teamA;
                const team2 = m.team2 || m.teamB;

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#1a1f2c] border border-[#252a37] hover:border-[#4d8eff]/50 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#4cd7f6] uppercase">
                        {m.sportType} • {m.tournament?.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-red-400 font-mono text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span>LIVE</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#090e1a] border border-[#1a1f2c] flex items-center justify-between text-xs sm:text-sm font-bold text-white">
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

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[#8c909f]">{m.venue || 'Campus Arena'}</span>
                      <Link
                        to={`/scoreboard/${m.id}?mode=scorer`}
                        className="text-[#4cd7f6] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Open Scoring Console</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-Time System Event Feed */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4edea3]" />
              <span>Real-Time Audit Telemetry</span>
            </h2>
            <span className="text-[10px] font-mono text-[#4edea3]">LIVE SYNC</span>
          </div>

          <div className="p-4 rounded-xl bg-[#1a1f2c] border border-[#252a37] space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-xs text-[#8c909f] italic">No scoring events logged today.</p>
            ) : (
              <div className="space-y-2">
                {recentEvents.slice(0, 8).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-[#090e1a] border border-[#252a37] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-[#252a37] text-[#4cd7f6]">
                        {evt.eventType}
                      </span>
                      <span className="text-[10px] font-mono text-[#8c909f]">
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white text-[11px] font-medium leading-tight">
                      {evt.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
