import React from 'react';
import { Timer, Activity } from 'lucide-react';
import LiveBadge from '../common/LiveBadge';

const BasketballScoreboard = ({ match, score, events = [] }) => {
  if (!match || !score) return null;

  const team1 = match.team1 || match.teamA;
  const team2 = match.team2 || match.teamB;

  const team1Score = score.team1Score ?? score.teamAPoints ?? 0;
  const team2Score = score.team2Score ?? score.teamBPoints ?? 0;
  const team1Fouls = score.team1Fouls ?? score.teamAFouls ?? 0;
  const team2Fouls = score.team2Fouls ?? score.teamBFouls ?? 0;
  const team1Bonus = score.team1Bonus ?? false;
  const team2Bonus = score.team2Bonus ?? false;
  const possessionTeamId = score.possessionTeamId;

  return (
    <div className="space-y-5">
      {/* Arena Style Scorecard (Stitch dark surface) */}
      <div className="bg-[#1a1f2c] border border-[#252a37] rounded-xl p-5 sm:p-7 space-y-5 shadow-lg">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#252a37]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#252a37] text-[#4cd7f6] uppercase tracking-wider">
              BASKETBALL
            </span>
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#252a37] text-[#c2c6d6] border border-[#343947]">
              {score.currentPeriod || score.currentQuarter || 'Q1'}
            </span>
            {match.status === 'LIVE' && <LiveBadge />}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#090e1a] border border-[#252a37] font-mono text-xs text-[#4cd7f6] font-bold">
            <Timer className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span>{score.gameClock || score.quarterTimeLeft || '10:00'}</span>
          </div>
        </div>

        {/* Central Match Score Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 my-4">
          {/* Team 1 */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <div className="flex items-center gap-2">
              {possessionTeamId === team1.id && (
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]" title="Ball Possession">
                  sports_basketball
                </span>
              )}
              <div className="w-14 h-14 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-base shadow">
                {team1.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#dee2f4] tracking-tight">{team1.name}</h3>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#8c909f]">Fouls: <strong className="text-[#dee2f4]">{team1Fouls}</strong></span>
              {team1Bonus && <span className="text-[#4edea3] font-bold">• BONUS</span>}
            </div>
          </div>

          {/* Points Box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#090e1a] border border-[#1a1f2c]">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="font-score-display text-5xl sm:text-6xl font-black text-white font-mono tabular-nums">
                {team1Score}
              </span>
              <span className="text-2xl font-bold text-[#8c909f] font-mono">:</span>
              <span className="font-score-display text-5xl sm:text-6xl font-black text-white font-mono tabular-nums">
                {team2Score}
              </span>
            </div>
            <span className="mt-2 text-[11px] font-mono font-bold text-[#4cd7f6] uppercase tracking-widest">
              {score.currentPeriod || score.currentQuarter || 'Q1'} • {score.gameClock || score.quarterTimeLeft || '10:00'}
            </span>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-[#252a37] text-[#c2c6d6] flex items-center justify-center font-bold text-base shadow">
                {team2.name.substring(0, 2).toUpperCase()}
              </div>
              {possessionTeamId === team2.id && (
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]" title="Ball Possession">
                  sports_basketball
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#dee2f4] tracking-tight">{team2.name}</h3>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#8c909f]">Fouls: <strong className="text-[#dee2f4]">{team2Fouls}</strong></span>
              {team2Bonus && <span className="text-[#4edea3] font-bold">• BONUS</span>}
            </div>
          </div>
        </div>

        {/* Latest Highlight */}
        {score.lastEventDescription && (
          <div className="p-3 rounded-lg bg-[#090e1a] border border-[#252a37] text-xs text-[#dee2f4] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4cd7f6] shrink-0" />
            <span className="font-bold text-[#4cd7f6]">Play Highlight:</span>
            <span className="truncate">{score.lastEventDescription}</span>
          </div>
        )}
      </div>

      {/* Events Timeline */}
      <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-5 space-y-4">
        <h4 className="text-xs font-bold text-[#dee2f4] uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#4cd7f6]" />
          <span>Play-by-Play Scoring Timeline</span>
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-[#8c909f] italic">No plays logged in this game yet.</p>
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
                      evt.points === 3
                        ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30'
                        : evt.points === 2
                        ? 'bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/30'
                        : evt.eventType === 'FOUL'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-[#252a37] text-[#c2c6d6]'
                    }`}
                  >
                    {evt.eventType}
                  </span>
                  <span className="text-[#dee2f4] font-medium">{evt.description}</span>
                </div>

                <div className="flex items-center gap-2 text-[#8c909f] font-mono text-[11px] shrink-0">
                  {evt.points > 0 && <span className="font-bold text-white">+{evt.points} PTS</span>}
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

export default BasketballScoreboard;
