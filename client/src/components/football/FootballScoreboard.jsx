import React from 'react';
import { Timer, Activity, ShieldAlert, Award } from 'lucide-react';

const FootballScoreboard = ({ match, score, events = [] }) => {
  if (!match || !score) return null;

  const { teamA, teamB } = match;

  return (
    <div className="space-y-6">
      {/* Stadium Style Score Display */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-emerald-950/30 border border-slate-700/80 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ⚽ Football / Soccer
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {score.currentHalf || '1st Half'}
            </span>
            {match.status === 'LIVE' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                LIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm">
            <Timer className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{score.matchMinutes}&apos;</span>
          </div>
        </div>

        {/* Central Match Score Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 my-8">
          {/* Team A */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <img
              src={teamA.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${teamA.name}`}
              alt={teamA.name}
              className="w-20 h-20 rounded-2xl bg-slate-800 p-2 border border-slate-700 object-cover shadow-lg"
            />
            <h3 className="text-xl font-bold text-white tracking-tight">{teamA.name}</h3>
            <p className="text-xs text-slate-400">{teamA.college}</p>
          </div>

          {/* Goals Center */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-navy-950/70 border border-slate-800 shadow-inner">
            <div className="flex items-center gap-6">
              <span className="text-5xl md:text-6xl font-black text-white font-mono tracking-wider">
                {score.teamAGoals}
              </span>
              <span className="text-3xl font-bold text-slate-600 font-mono">-</span>
              <span className="text-5xl md:text-6xl font-black text-white font-mono tracking-wider">
                {score.teamBGoals}
              </span>
            </div>
            <div className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
              {score.currentHalf || 'Regular Time'}
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <img
              src={teamB.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${teamB.name}`}
              alt={teamB.name}
              className="w-20 h-20 rounded-2xl bg-slate-800 p-2 border border-slate-700 object-cover shadow-lg"
            />
            <h3 className="text-xl font-bold text-white tracking-tight">{teamB.name}</h3>
            <p className="text-xs text-slate-400">{teamB.college}</p>
          </div>
        </div>

        {/* Latest Match Event Banner */}
        {score.lastEventDescription && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">Match Highlight:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Match Events Timeline */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Goals, Cards & Match Incidents
        </h4>
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No events recorded for this match yet.</p>
        ) : (
          <div className="space-y-2.5">
            {events.slice(0, 10).map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0 ${
                    evt.eventType === 'GOAL'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : evt.eventType === 'CARD_RED'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : evt.eventType === 'CARD_YELLOW'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {evt.period || 'Event'}
                  </span>
                  <p className="text-xs text-slate-200 font-medium">
                    {evt.description}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
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
