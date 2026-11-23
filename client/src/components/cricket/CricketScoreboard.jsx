import React from 'react';
import { formatCricketOvers, calculateRunRate } from '../../utils/formatters';
import { Trophy, TrendingUp, Target, Activity } from 'lucide-react';

const CricketScoreboard = ({ match, score, events = [] }) => {
  if (!match || !score) return null;

  const { teamA, teamB } = match;
  const isTeamABatting = (score.battingTeamId || teamA.id) === teamA.id;
  const battingTeam = isTeamABatting ? teamA : teamB;
  const bowlingTeam = isTeamABatting ? teamB : teamA;

  const battingRuns = isTeamABatting ? score.teamARuns : score.teamBRuns;
  const battingWickets = isTeamABatting ? score.teamAWickets : score.teamBWickets;
  const battingBalls = isTeamABatting ? score.teamABalls : score.teamBBalls;
  const battingOvers = formatCricketOvers(battingBalls);
  const battingExtras = isTeamABatting ? score.teamAExtras : score.teamBExtras;

  const bowlingRuns = isTeamABatting ? score.teamBRuns : score.teamARuns;
  const bowlingWickets = isTeamABatting ? score.teamBWickets : score.teamAWickets;
  const bowlingBalls = isTeamABatting ? score.teamBBalls : score.teamABalls;
  const bowlingOvers = formatCricketOvers(bowlingBalls);

  const crr = calculateRunRate(battingRuns, battingBalls);

  // Chase calculations if Inning 2
  const isInning2 = score.currentInning === 2;
  const target = score.targetRuns || (bowlingRuns > 0 ? bowlingRuns + 1 : null);
  const runsNeeded = target ? target - battingRuns : null;
  // Assume 20 over match (120 balls) for standard collegiate T20
  const totalInningBalls = 120;
  const ballsRemaining = Math.max(0, totalInningBalls - battingBalls);
  const requiredRunRate = (runsNeeded > 0 && ballsRemaining > 0)
    ? ((runsNeeded / ballsRemaining) * 6).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {/* Primary Score Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-blue-950/40 border border-slate-700/80 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        {/* Current Inning & Match Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              🏏 Cricket T20
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              {score.currentInning === 1 ? '1st Inning' : '2nd Inning'}
            </span>
            {match.status === 'LIVE' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                LIVE
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-slate-400">
            {match.venue}
          </div>
        </div>

        {/* Big Teams Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
          {/* Batting Team Card */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-blue-600/10 border border-blue-500/30 shadow-inner">
            <img
              src={battingTeam.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${battingTeam.name}`}
              alt={battingTeam.name}
              className="w-16 h-16 rounded-2xl bg-slate-800 p-1 border border-blue-400/30 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{battingTeam.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 uppercase">
                  Batting
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                  {battingRuns}<span className="text-blue-400">/{battingWickets}</span>
                </span>
                <span className="text-lg font-mono text-slate-300">
                  ({battingOvers} ov)
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Extras: <span className="text-white font-mono">{battingExtras}</span>
              </div>
            </div>
          </div>

          {/* Bowling Team Card */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <img
              src={bowlingTeam.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${bowlingTeam.name}`}
              alt={bowlingTeam.name}
              className="w-16 h-16 rounded-2xl bg-slate-800 p-1 border border-slate-700 object-cover opacity-80"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-200">{bowlingTeam.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700/60 text-slate-400 uppercase">
                  Bowling
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                {isInning2 ? (
                  <span className="text-2xl font-bold text-slate-300 font-mono">
                    {bowlingRuns}/{bowlingWickets} <span className="text-xs text-slate-400 font-sans">({bowlingOvers} ov)</span>
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">Yet to bat (2nd Inning)</span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Fielding & Bowling
              </div>
            </div>
          </div>
        </div>

        {/* Run Rate & Match Equations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-navy-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              Current Run Rate
            </span>
            <div className="text-xl font-bold text-blue-400 font-mono mt-1">{crr}</div>
          </div>

          {target && (
            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Target Score
              </span>
              <div className="text-xl font-bold text-amber-400 font-mono mt-1">{target}</div>
            </div>
          )}

          {requiredRunRate && runsNeeded > 0 && (
            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Req. Run Rate</span>
              <div className="text-xl font-bold text-rose-400 font-mono mt-1">{requiredRunRate}</div>
            </div>
          )}

          {isInning2 && runsNeeded !== null && (
            <div className="bg-navy-950/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Equation</span>
              <div className="text-xs font-semibold text-white mt-1">
                {runsNeeded <= 0 ? (
                  <span className="text-emerald-400 font-bold">Target Achieved!</span>
                ) : (
                  <span>Need <strong className="text-amber-400 font-mono">{runsNeeded}</strong> from <strong className="text-blue-400 font-mono">{ballsRemaining}</strong> balls</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Latest Commentary / Event Headline */}
        {score.lastEventDescription && (
          <div className="mt-5 p-3 rounded-xl bg-blue-950/50 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-semibold text-white">Latest Ball:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Ball by Ball Timeline Feed */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Recent Ball Events & Commentary
        </h4>
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No events recorded for this match yet.</p>
        ) : (
          <div className="space-y-2.5">
            {events.slice(0, 10).map((evt) => (
              <div
                key={evt.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0 ${
                    evt.eventType === 'WICKET'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : evt.eventType === 'EXTRA'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {evt.period || 'Ball'}
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
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

export default CricketScoreboard;
