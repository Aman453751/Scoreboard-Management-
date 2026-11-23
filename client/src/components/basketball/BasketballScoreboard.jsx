import React from 'react';
import { Timer, Activity, Award } from 'lucide-react';

const BasketballScoreboard = ({ match, score, events = [] }) => {
  if (!match || !score) return null;

  const { teamA, teamB } = match;

  return (
    <div className="space-y-6">
      {/* Basketball Arena Scoreboard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-orange-950/30 border border-slate-700/80 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
              🏀 Basketball Championship
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              {score.currentQuarter || 'Q1'}
            </span>
            {match.status === 'LIVE' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                LIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-orange-400 font-mono text-sm font-bold">
            <Timer className="w-4 h-4 text-orange-400" />
            <span>{score.quarterTimeLeft || '10:00'}</span>
          </div>
        </div>

        {/* Central Points Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 my-8">
          {/* Team A */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <img
              src={teamA.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${teamA.name}`}
              alt={teamA.name}
              className="w-20 h-20 rounded-2xl bg-slate-800 p-2 border border-slate-700 object-cover shadow-lg"
            />
            <h3 className="text-xl font-bold text-white tracking-tight">{teamA.name}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Fouls: <strong className="text-amber-400 font-mono">{score.teamAFouls}</strong></span>
            </div>
          </div>

          {/* Points Box */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-navy-950/80 border border-orange-500/20 shadow-inner">
            <div className="flex items-center gap-6">
              <span className="text-5xl md:text-6xl font-black text-white font-mono tracking-wider">
                {score.teamAPoints}
              </span>
              <span className="text-3xl font-bold text-slate-600 font-mono">:</span>
              <span className="text-5xl md:text-6xl font-black text-white font-mono tracking-wider">
                {score.teamBPoints}
              </span>
            </div>
            <div className="mt-2 text-xs font-bold text-orange-400 uppercase tracking-widest font-mono">
              {score.currentQuarter || 'Q1'} - {score.quarterTimeLeft || '10:00'}
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
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Fouls: <strong className="text-amber-400 font-mono">{score.teamBFouls}</strong></span>
            </div>
          </div>
        </div>

        {/* Highlight Banner */}
        {score.lastEventDescription && (
          <div className="p-3.5 rounded-xl bg-orange-950/40 border border-orange-500/20 text-xs text-orange-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-semibold text-white">Court Action:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Basketball Events Feed */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-400" />
          Play-by-Play & Scoring Timeline
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
                    evt.eventType === 'POINT_3'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : evt.eventType === 'FOUL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
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

export default BasketballScoreboard;
