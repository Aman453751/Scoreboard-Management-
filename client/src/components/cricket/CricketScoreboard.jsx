import React from 'react';
import { formatCricketOvers, calculateRunRate } from '../../utils/formatters';
import { TrendingUp, Target, Activity, Trophy } from 'lucide-react';
import LiveBadge from '../common/LiveBadge';

const CricketScoreboard = ({ match, score, events = [] }) => {
  if (!match || !score) return null;

  const team1 = match.team1 || match.teamA;
  const team2 = match.team2 || match.teamB;

  const isTeam1Batting = (score.battingTeamId || team1.id) === team1.id;
  const battingTeam = isTeam1Batting ? team1 : team2;
  const bowlingTeam = isTeam1Batting ? team2 : team1;

  const battingRuns = isTeam1Batting ? (score.team1Runs ?? score.teamARuns ?? 0) : (score.team2Runs ?? score.teamBRuns ?? 0);
  const battingWickets = isTeam1Batting ? (score.team1Wickets ?? score.teamAWickets ?? 0) : (score.team2Wickets ?? score.teamBWickets ?? 0);
  const battingBalls = isTeam1Batting ? (score.team1Balls ?? score.teamABalls ?? 0) : (score.team2Balls ?? score.teamBBalls ?? 0);
  const battingOvers = formatCricketOvers(battingBalls);
  const battingExtras = isTeam1Batting ? (score.team1Extras ?? score.teamAExtras ?? 0) : (score.team2Extras ?? score.teamBExtras ?? 0);

  const bowlingRuns = isTeam1Batting ? (score.team2Runs ?? score.teamBRuns ?? 0) : (score.team1Runs ?? score.teamARuns ?? 0);
  const bowlingWickets = isTeam1Batting ? (score.team2Wickets ?? score.teamBWickets ?? 0) : (score.team1Wickets ?? score.teamAWickets ?? 0);
  const bowlingBalls = isTeam1Batting ? (score.team2Balls ?? score.teamBBalls ?? 0) : (score.team1Balls ?? score.teamABalls ?? 0);
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
    <div className="space-y-5">
      {/* Primary Scoreboard Surface (Stitch container style) */}
      <div className="bg-[#1a1f2c] border border-[#252a37] rounded-xl p-5 sm:p-7 space-y-5 shadow-lg">
        {/* Match Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#252a37]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#252a37] text-[#4cd7f6] uppercase tracking-wider">
              CRICKET T20
            </span>
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/30">
              {score.currentInning === 1 ? '1ST INNING' : '2ND INNING'}
            </span>
            {match.status === 'LIVE' && <LiveBadge />}
          </div>
          <div className="text-xs font-mono text-[#8c909f]">
            {match.venue || 'Pitch 1 • Campus Ground'}
          </div>
        </div>

        {/* Teams Matchup Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batting Team (Elevated Card) */}
          <div className="p-4 rounded-xl bg-[#090e1a] border border-[#4d8eff]/30 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-sm shadow">
                  {battingTeam.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#dee2f4] tracking-tight">{battingTeam.name}</h3>
                  <span className="text-[11px] text-[#4edea3] font-mono font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                    Currently Batting
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight tabular-nums">
                {battingRuns}<span className="text-[#4cd7f6]">/{battingWickets}</span>
              </span>
              <span className="text-sm font-mono text-[#8c909f]">
                ({battingOvers} / 20.0 ov)
              </span>
            </div>

            <div className="text-xs text-[#8c909f] pt-2 border-t border-[#1a1f2c] flex items-center justify-between">
              <span>Extras: <strong className="text-white font-mono">{battingExtras}</strong></span>
              <span className="font-mono">CRR: <strong className="text-[#4cd7f6]">{crr}</strong></span>
            </div>
          </div>

          {/* Bowling / Fielding Team */}
          <div className="p-4 rounded-xl bg-[#090e1a] border border-[#252a37] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#252a37] text-[#c2c6d6] flex items-center justify-center font-bold text-sm">
                  {bowlingTeam.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#c2c6d6] tracking-tight">{bowlingTeam.name}</h3>
                  <span className="text-[11px] text-[#8c909f] font-mono uppercase tracking-wider">
                    {isInning2 ? '1st Innings Score' : 'Fielding'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-bold text-[#c2c6d6] font-mono tracking-tight tabular-nums">
                {bowlingRuns}<span className="text-[#8c909f]">/{bowlingWickets}</span>
              </span>
              <span className="text-sm font-mono text-[#8c909f]">
                ({bowlingOvers} ov)
              </span>
            </div>

            <div className="text-xs text-[#8c909f] pt-2 border-t border-[#1a1f2c] flex items-center justify-between">
              <span>Overs Bowled: <strong className="text-white font-mono">{battingOvers}</strong></span>
              <span className="text-[#4cd7f6] font-mono">T20 Overs: 20</span>
            </div>
          </div>
        </div>

        {/* 2nd Inning Chase Calculation Bar (Stitch Equation Pill) */}
        {isInning2 && target && (
          <div className="p-3.5 rounded-lg bg-[#0e131f] border border-[#252a37] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#c2c6d6]">
              <Target className="w-4 h-4 text-[#4cd7f6]" />
              <span>Target: <strong className="text-white font-mono">{target}</strong> runs</span>
            </div>
            {runsNeeded > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-[#4cd7f6] font-semibold">
                  Need <strong className="text-white font-mono">{runsNeeded}</strong> runs in <strong className="text-white font-mono">{ballsRemaining}</strong> balls
                </span>
                {requiredRunRate && (
                  <span className="text-[#8c909f] font-mono text-[11px]">
                    (Req: {requiredRunRate} RPO)
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[#4edea3] font-bold">
                Target achieved!
              </span>
            )}
          </div>
        )}

        {/* Last Ball / Event Banner */}
        {score.lastEventDescription && (
          <div className="p-3 rounded-lg bg-[#090e1a] border border-[#252a37] text-xs text-[#dee2f4] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
            <span className="font-bold text-[#4cd7f6]">Last Event:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Events / Ball-by-Ball Feed */}
      <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-5 space-y-4">
        <h4 className="text-xs font-bold text-[#dee2f4] uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#4cd7f6]" />
          <span>Recent Ball-by-Ball Timeline</span>
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-[#8c909f] italic">No balls bowled in this session yet.</p>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 15).map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#090e1a] border border-[#252a37] hover:border-[#343947] transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      evt.eventType === 'WICKET'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : evt.eventType === 'FOUR' || evt.eventType === 'SIX'
                        ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30'
                        : evt.eventType === 'WIDE' || evt.eventType === 'NO_BALL'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-[#252a37] text-[#c2c6d6]'
                    }`}
                  >
                    {evt.eventType}
                  </span>
                  <span className="text-[#dee2f4] font-medium">{evt.description}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[#8c909f] font-mono text-[11px]">
                  {evt.runsScored > 0 && (
                    <span className="font-bold text-[#dee2f4]">+{evt.runsScored} run</span>
                  )}
                  <span>{new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CricketScoreboard;
