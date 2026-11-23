import React, { useState } from 'react';
import { scoreService } from '../../services/scoreService';
import { RotateCcw, AlertOctagon, Plus, Clock, ShieldAlert } from 'lucide-react';

const FootballScorerControl = ({ match, score, onScoreUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchMinutes, setMatchMinutes] = useState(score?.matchMinutes ?? 0);
  const [currentHalf, setCurrentHalf] = useState(score?.currentHalf || '1st Half');
  const [customDescription, setCustomDescription] = useState('');

  if (!match || !score) return null;

  const team1 = match.team1 || match.teamA;
  const team2 = match.team2 || match.teamB;

  const handleAction = async (action, teamTarget, extraDesc = '') => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        action,
        teamTarget,
        matchMinutes: parseInt(matchMinutes, 10),
        currentHalf,
        description: customDescription || extraDesc || undefined
      };

      const res = await scoreService.updateScore(match.id, payload);
      if (res.success) {
        setCustomDescription('');
        if (onScoreUpdated) onScoreUpdated(res.data.score);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update match score.');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await scoreService.undoScore(match.id);
      if (res.success && onScoreUpdated) {
        onScoreUpdated(res.data.score);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to undo action.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTimer = async () => {
    await handleAction('TIMER', null, `Match clock updated to ${matchMinutes}'`);
  };

  const handleHalfChange = async (newHalf) => {
    setCurrentHalf(newHalf);
    await handleAction('HALF_CHANGE', null, `Match period set to ${newHalf}`);
  };

  const team1Goals = score.team1Goals ?? score.teamAGoals ?? 0;
  const team2Goals = score.team2Goals ?? score.teamBGoals ?? 0;

  return (
    <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#252a37]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
            <span>Football Sideline Scoring Console</span>
          </h3>
          <p className="text-xs text-[#8c909f] mt-0.5">
            {team1.name} ({team1Goals}) vs {team2.name} ({team2Goals})
          </p>
        </div>

        <button
          onClick={handleUndo}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold active:scale-95 transition-all disabled:opacity-50"
          title="Rollback last play or card"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Instant Undo</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Clock & Half Bar */}
      <div className="p-3 rounded-lg bg-[#090e1a] border border-[#252a37] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-[#8c909f] font-semibold">Match Clock (Min):</label>
          <input
            type="number"
            min="0"
            max="130"
            value={matchMinutes}
            onChange={(e) => setMatchMinutes(e.target.value)}
            className="w-16 bg-[#1a1f2c] border border-[#252a37] rounded px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-[#4d8eff]"
          />
          <button
            onClick={handleUpdateTimer}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-[#252a37] hover:bg-[#343947] text-white text-[11px] font-semibold"
          >
            Update Min
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {['1st Half', 'Half Time', '2nd Half', 'Extra Time', 'Full Time'].map((half) => (
            <button
              key={half}
              onClick={() => handleHalfChange(half)}
              disabled={loading}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                currentHalf === half
                  ? 'bg-[#4d8eff] text-[#00285d]'
                  : 'bg-[#1a1f2c] text-[#8c909f] hover:text-white'
              }`}
            >
              {half}
            </button>
          ))}
        </div>
      </div>

      {/* Team Scoring Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team 1 Controls */}
        <div className="p-4 rounded-xl bg-[#090e1a] border border-[#252a37] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{team1.name}</h4>
            <span className="text-lg font-mono font-bold text-[#4edea3]">{team1Goals} Goals</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction('GOAL', 'team1', `Goal scored by ${team1.name}`)}
              disabled={loading}
              className="py-2.5 rounded bg-[#4edea3] hover:brightness-110 text-[#003824] font-bold text-xs shadow flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Goal (+1)</span>
            </button>
            <button
              onClick={() => handleAction('FOUL', 'team1', `Foul committed by ${team1.name}`)}
              disabled={loading}
              className="py-2.5 rounded bg-[#252a37] hover:bg-[#343947] text-white font-semibold text-xs"
            >
              Foul (+1)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1a1f2c]">
            <button
              onClick={() => handleAction('YELLOW_CARD', 'team1', `Yellow card issued to ${team1.name}`)}
              disabled={loading}
              className="py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30"
            >
              🟨 Yellow Card
            </button>
            <button
              onClick={() => handleAction('RED_CARD', 'team1', `Red card issued to ${team1.name}`)}
              disabled={loading}
              className="py-1.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold hover:bg-red-500/30"
            >
              🟥 Red Card
            </button>
          </div>
        </div>

        {/* Team 2 Controls */}
        <div className="p-4 rounded-xl bg-[#090e1a] border border-[#252a37] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{team2.name}</h4>
            <span className="text-lg font-mono font-bold text-[#4edea3]">{team2Goals} Goals</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction('GOAL', 'team2', `Goal scored by ${team2.name}`)}
              disabled={loading}
              className="py-2.5 rounded bg-[#4edea3] hover:brightness-110 text-[#003824] font-bold text-xs shadow flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Goal (+1)</span>
            </button>
            <button
              onClick={() => handleAction('FOUL', 'team2', `Foul committed by ${team2.name}`)}
              disabled={loading}
              className="py-2.5 rounded bg-[#252a37] hover:bg-[#343947] text-white font-semibold text-xs"
            >
              Foul (+1)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1a1f2c]">
            <button
              onClick={() => handleAction('YELLOW_CARD', 'team2', `Yellow card issued to ${team2.name}`)}
              disabled={loading}
              className="py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30"
            >
              🟨 Yellow Card
            </button>
            <button
              onClick={() => handleAction('RED_CARD', 'team2', `Red card issued to ${team2.name}`)}
              disabled={loading}
              className="py-1.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold hover:bg-red-500/30"
            >
              🟥 Red Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballScorerControl;
