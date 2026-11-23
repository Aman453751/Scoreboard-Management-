import React from 'react';
import { formatCricketOvers, calculateRunRate } from '../../utils/formatters';
import { TrendingUp, Target, Activity, Trophy } from 'lucide-react';
import LiveBadge from '../common/LiveBadge';

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

  // Chase equations if Inning 2
  const isInning2 = score.currentInning === 2;
  const target = score.targetRuns || (bowlingRuns > 0 ? bowlingRuns + 1 : null);
  const runsNeeded = target ? target - battingRuns : null;
  const totalInningBalls = 120; // Standard 20 overs
  const ballsRemaining = Math.max(0, totalInningBalls - battingBalls);
  const requiredRunRate = (runsNeeded > 0 && ballsRemaining > 0)
    ? ((runsNeeded / ballsRemaining) * 6).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {/* Primary Scoreboard Surface */}
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        {/* Match Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-amber-400 border border-slate-700">
              CRICKET T20
            </span>
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-900/30 text-blue-300 border border-blue-700/50">
              {score.currentInning === 1 ? '1ST INNING' : '2ND INNING'}
            </span>
            {match.status === 'LIVE' && <LiveBadge />}
          </div>
          <div className="text-xs font-mono text-slate-400">
            {match.venue}
          </div>
        </div>

        {/* Teams Matchup Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batting Team */}
          <div className="p-5 rounded-lg bg-slate-850/80 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={battingTeam.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${battingTeam.name}`}
                  alt={battingTeam.name}
                  className="w-12 h-12 rounded-lg bg-slate-800 p-1 border border-slate-700 object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{battingTeam.name}</h3>
                  <span className="text-[11px] text-blue-400 font-mono font-semibold uppercase tracking-wider">
                    ● Currently Batting
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight tabular-nums">
                {battingRuns}<span className="text-blue-400">/{battingWickets}</span>
              </span>
              <span className="text-sm font-mono text-slate-400">
                ({battingOvers} / 20.0 ov)
              </span>
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Extras Awarded: <strong className="text-white font-mono">{battingExtras}</strong></span>
              <span className="font-mono text-slate-400">CRR: <strong className="text-blue-400">{crr}</strong></span>
            </div>
          </div>

          {/* Bowling / Fielding Team */}
          <div className="p-5 rounded-lg bg-slate-850/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={bowlingTeam.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${bowlingTeam.name}`}
                  alt={bowlingTeam.name}
                  className="w-12 h-12 rounded-lg bg-slate-800 p-1 border border-slate-700 object-cover opacity-80"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-200 tracking-tight">{bowlingTeam.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                    Fielding & Bowling
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2 pt-1">
              {isInning2 ? (
                <span className="text-3xl font-black text-slate-300 font-mono tabular-nums">
                  {bowlingRuns}/{bowlingWickets} <span className="text-xs text-slate-400 font-normal font-sans">({bowlingOvers} ov)</span>
                </span>
              ) : (
                <span className="text-sm text-slate-400 italic">Scheduled to bat in 2nd Inning</span>
              )}
            </div>

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Target: <strong className="text-amber-400 font-mono">{target || 'TBD'}</strong></span>
              {requiredRunRate && runsNeeded > 0 && (
                <span className="font-mono text-slate-400">RRR: <strong className="text-rose-400">{requiredRunRate}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Equation Strip */}
        {isInning2 && runsNeeded !== null && (
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">
                {runsNeeded <= 0 ? (
                  <strong className="text-emerald-400">Target Achieved! {battingTeam.name} won the match.</strong>
                ) : (
                  <span>
                    Need <strong className="text-amber-400 font-mono">{runsNeeded}</strong> runs from <strong className="text-blue-400 font-mono">{ballsRemaining}</strong> balls
                  </span>
                )}
              </span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">Target: {target}</span>
          </div>
        )}

        {/* Latest Ball Commentary */}
        {score.lastEventDescription && (
          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-bold text-white">Latest Ball:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Ball by Ball Commentary Feed */}
      <div className="rounded-xl bg-navy-900 border border-slate-800 p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Ball-by-Ball Timeline & Commentary</span>
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No balls recorded in this match yet.</p>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 12).map((evt) => (
              <div
                key={evt.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-850/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    evt.eventType === 'WICKET'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : evt.eventType === 'EXTRA'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {evt.period || 'Ball'}
                  </span>
                  <p className="text-slate-200 leading-relaxed font-medium">
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

export default CricketScoreboard;
