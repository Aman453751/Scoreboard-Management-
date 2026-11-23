import React from 'react';
import { Timer, Activity } from 'lucide-react';
import LiveBadge from '../common/LiveBadge';

const BasketballScoreboard = ({ match, score, events = [] }) => {
  if (!match || !score) return null;

  const { teamA, teamB } = match;

  return (
    <div className="space-y-6">
      {/* Arena Style Scorecard */}
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-orange-400 border border-slate-700">
              BASKETBALL
            </span>
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {score.currentQuarter || 'Q1'}
            </span>
            {match.status === 'LIVE' && <LiveBadge />}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-orange-400 font-bold">
            <Timer className="w-3.5 h-3.5 text-orange-400" />
            <span>{score.quarterTimeLeft || '10:00'}</span>
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
            <span className="text-xs text-slate-400 font-mono">
              Fouls: <strong className="text-amber-400">{score.teamAFouls}</strong>
            </span>
          </div>

          {/* Points Box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-navy-950 border border-slate-800">
            <div className="flex items-center gap-5">
              <span className="text-5xl sm:text-6xl font-black text-white font-mono tabular-nums">
                {score.teamAPoints}
              </span>
              <span className="text-2xl font-bold text-slate-600 font-mono">:</span>
              <span className="text-5xl sm:text-6xl font-black text-white font-mono tabular-nums">
                {score.teamBPoints}
              </span>
            </div>
            <span className="mt-2 text-[11px] font-mono font-bold text-orange-400 uppercase tracking-widest">
              {score.currentQuarter || 'Q1'} - {score.quarterTimeLeft || '10:00'}
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
            <span className="text-xs text-slate-400 font-mono">
              Fouls: <strong className="text-amber-400">{score.teamBFouls}</strong>
            </span>
          </div>
        </div>

        {/* Latest Highlight */}
        {score.lastEventDescription && (
          <div className="p-3 rounded-lg bg-orange-950/40 border border-orange-500/20 text-xs text-orange-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-bold text-white">Court Play:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Play-by-Play Timeline */}
      <div className="rounded-xl bg-navy-900 border border-slate-800 p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-400" />
          <span>Play-by-Play Scoring Timeline</span>
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No plays recorded in this game yet.</p>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 12).map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-850/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    evt.eventType === 'POINT_3'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : evt.eventType === 'FOUL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {evt.period || 'Play'}
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

export default BasketballScoreboard;
