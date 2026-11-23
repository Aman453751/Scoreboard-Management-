import React from 'react';
import { Timer, Activity, ShieldAlert } from 'lucide-react';
import LiveBadge from '../common/LiveBadge';

const FootballScoreboard = ({ match, score, events = [] }) => {
  if (!match || !score) return null;

  const { teamA, teamB } = match;

  return (
    <div className="space-y-6">
      {/* Stadium Style Scorecard */}
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-emerald-400 border border-slate-700">
              FOOTBALL LEAGUE
            </span>
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {score.currentHalf || '1ST HALF'}
            </span>
            {match.status === 'LIVE' && <LiveBadge />}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            <Timer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">{score.matchMinutes}&apos;</span>
          </div>
        </div>

        {/* Central Match Score Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 my-6">
          {/* Team A */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <img
              src={teamA.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${teamA.name}`}
              alt={teamA.name}
              className="w-16 h-16 rounded-lg bg-slate-800 p-1.5 border border-slate-700 object-cover"
            />
            <h3 className="text-lg font-bold text-white tracking-tight">{teamA.name}</h3>
            <p className="text-xs text-slate-400">{teamA.college}</p>
          </div>

          {/* Scoreboard Number Box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center gap-5">
              <span className="text-5xl sm:text-6xl font-black text-white font-mono tabular-nums">
                {score.teamAGoals}
              </span>
              <span className="text-2xl font-bold text-slate-600 font-mono">-</span>
              <span className="text-5xl sm:text-6xl font-black text-white font-mono tabular-nums">
                {score.teamBGoals}
              </span>
            </div>
            <span className="mt-2 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
              {score.currentHalf || 'Regular Time'}
            </span>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <img
              src={teamB.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${teamB.name}`}
              alt={teamB.name}
              className="w-16 h-16 rounded-lg bg-slate-800 p-1.5 border border-slate-700 object-cover"
            />
            <h3 className="text-lg font-bold text-white tracking-tight">{teamB.name}</h3>
            <p className="text-xs text-slate-400">{teamB.college}</p>
          </div>
        </div>

        {/* Latest Incident Banner */}
        {score.lastEventDescription && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-white">Match Incident:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Events Timeline */}
      <div className="rounded-xl bg-navy-900 border border-slate-800 p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Match Incidents & Goals Timeline</span>
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No events recorded in this match yet.</p>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 12).map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-850/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    evt.eventType === 'GOAL'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : evt.eventType === 'CARD_RED'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : evt.eventType === 'CARD_YELLOW'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {evt.period || 'Event'}
                  </span>
                  <p className="text-slate-200 font-medium">
                    {evt.description}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FootballScoreboard;
