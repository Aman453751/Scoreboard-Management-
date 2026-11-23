import React from 'react';
import { Timer, Activity, ShieldAlert } from 'lucide-react';
import LiveBadge from '../common/LiveBadge';

const FootballScoreboard = ({ match, score, events = [] }) => {
  if (!match || !score) return null;

  const team1 = match.team1 || match.teamA;
  const team2 = match.team2 || match.teamB;

  const team1Goals = score.team1Goals ?? score.teamAGoals ?? 0;
  const team2Goals = score.team2Goals ?? score.teamBGoals ?? 0;
  const team1Fouls = score.team1Fouls ?? score.teamAFouls ?? 0;
  const team2Fouls = score.team2Fouls ?? score.teamBFouls ?? 0;

  return (
    <div className="space-y-5">
      {/* Stadium Style Scorecard (Stitch dark surface) */}
      <div className="bg-[#1a1f2c] border border-[#252a37] rounded-xl p-5 sm:p-7 space-y-5 shadow-lg">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#252a37]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#252a37] text-[#4edea3] uppercase tracking-wider">
              FOOTBALL LEAGUE
            </span>
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#252a37] text-[#c2c6d6] border border-[#343947]">
              {score.currentHalf || '1ST HALF'}
            </span>
            {match.status === 'LIVE' && <LiveBadge />}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#090e1a] border border-[#252a37] font-mono text-xs text-[#dee2f4]">
            <Timer className="w-3.5 h-3.5 text-[#4edea3]" />
            <span className="font-bold text-white">{score.matchMinutes ?? 0}&apos;</span>
          </div>
        </div>

        {/* Central Match Score Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 my-4">
          {/* Team 1 */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-base shadow">
              {team1.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#dee2f4] tracking-tight">{team1.name}</h3>
            <span className="text-xs text-[#8c909f] font-mono">
              Fouls: <strong className="text-[#dee2f4]">{team1Fouls}</strong>
            </span>
          </div>

          {/* Scoreboard Number Box (Stitch Score-Display) */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#090e1a] border border-[#1a1f2c]">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="font-score-display text-5xl sm:text-6xl font-black text-white font-mono tabular-nums">
                {team1Goals}
              </span>
              <span className="text-2xl font-bold text-[#8c909f] font-mono">-</span>
              <span className="font-score-display text-5xl sm:text-6xl font-black text-white font-mono tabular-nums">
                {team2Goals}
              </span>
            </div>
            <span className="mt-2 text-[11px] font-mono font-semibold text-[#4cd7f6] uppercase tracking-widest">
              {score.currentHalf || 'Regular Time'} • {score.matchMinutes ?? 0}&apos;
            </span>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#252a37] text-[#c2c6d6] flex items-center justify-center font-bold text-base shadow">
              {team2.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#dee2f4] tracking-tight">{team2.name}</h3>
            <span className="text-xs text-[#8c909f] font-mono">
              Fouls: <strong className="text-[#dee2f4]">{team2Fouls}</strong>
            </span>
          </div>
        </div>

        {/* Latest Incident Banner */}
        {score.lastEventDescription && (
          <div className="p-3 rounded-lg bg-[#090e1a] border border-[#252a37] text-xs text-[#dee2f4] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4edea3] shrink-0" />
            <span className="font-bold text-[#4edea3]">Match Incident:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Events Timeline */}
      <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-5 space-y-4">
        <h4 className="text-xs font-bold text-[#dee2f4] uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#4edea3]" />
          <span>Match Incidents & Goals Timeline</span>
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-[#8c909f] italic">No incidents recorded in this match yet.</p>
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
                      evt.eventType === 'GOAL'
                        ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30'
                        : evt.eventType === 'RED_CARD'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : evt.eventType === 'YELLOW_CARD'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-[#252a37] text-[#c2c6d6]'
                    }`}
                  >
                    {evt.eventType}
                  </span>
                  <span className="text-[#dee2f4] font-medium">{evt.description}</span>
                </div>

                <div className="flex items-center gap-2 text-[#8c909f] font-mono text-[11px] shrink-0">
                  {evt.minute && <span>{evt.minute}&apos;</span>}
                  <span>{new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FootballScoreboard;
