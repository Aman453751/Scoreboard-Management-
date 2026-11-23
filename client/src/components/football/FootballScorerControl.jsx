import React, { useState } from 'react';
import { scoreService } from '../../services/scoreService';
import { RotateCcw, AlertOctagon, Plus, Clock, ShieldAlert } from 'lucide-react';

const FootballScorerControl = ({ match, score, onScoreUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchMinutes, setMatchMinutes] = useState(score?.matchMinutes || 0);
  const [currentHalf, setCurrentHalf] = useState(score?.currentHalf || '1st Half');
  const [customDescription, setCustomDescription] = useState('');

  if (!match || !score) return null;

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
    await handleAction('TIMER', null, `Match clock set to ${matchMinutes}'`);
  };

  const handleHalfChange = async (newHalf) => {
    setCurrentHalf(newHalf);
    await handleAction('HALF_CHANGE', null, `Match period set to ${newHalf}`);
  };

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-700/80 p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Football Scoring Console
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {match.teamA.name} ({score.teamAGoals}) vs {match.teamB.name} ({score.teamBGoals})
          </p>
        </div>

        <button
          onClick={handleUndo}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo Last Event</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Team Scoring Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A Controls */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{match.teamA.name}</h4>
            <span className="text-xl font-mono font-black text-emerald-400">{score.teamAGoals} Goals</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAction('GOAL', 'A', `GOAL for ${match.teamA.name}!`)}
              disabled={loading}
              className="py-2.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Goal (+1)
            </button>
            <button
              onClick={() => handleAction('CARD_YELLOW', 'A')}
              disabled={loading}
              className="py-2.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs active:scale-95 disabled:opacity-50"
            >
              🟨 Yellow Card
            </button>
            <button
              onClick={() => handleAction('CARD_RED', 'A')}
              disabled={loading}
              className="py-2.5 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-semibold text-xs active:scale-95 disabled:opacity-50"
            >
              🟥 Red Card
            </button>
          </div>
        </div>

        {/* Team B Controls */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{match.teamB.name}</h4>
            <span className="text-xl font-mono font-black text-emerald-400">{score.teamBGoals} Goals</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAction('GOAL', 'B', `GOAL for ${match.teamB.name}!`)}
              disabled={loading}
              className="py-2.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Goal (+1)
            </button>
            <button
              onClick={() => handleAction('CARD_YELLOW', 'B')}
              disabled={loading}
              className="py-2.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs active:scale-95 disabled:opacity-50"
            >
              🟨 Yellow Card
            </button>
            <button
              onClick={() => handleAction('CARD_RED', 'B')}
              disabled={loading}
              className="py-2.5 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-semibold text-xs active:scale-95 disabled:opacity-50"
            >
              🟥 Red Card
            </button>
          </div>
        </div>
      </div>

      {/* Match Clock & Period Management */}
      <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Match Minute Clock
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="130"
                value={matchMinutes}
                onChange={(e) => setMatchMinutes(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono"
              />
              <button
                onClick={handleUpdateTimer}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold"
              >
                Set Time
              </button>
              <button
                onClick={() => {
                  const newMin = parseInt(matchMinutes, 10) + 1;
                  setMatchMinutes(newMin);
                  handleAction('TIMER', null, `Minute ${newMin}'`);
                }}
                disabled={loading}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                +1 min
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Match Period
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['1st Half', 'Half Time', '2nd Half', 'Full Time'].map((half) => (
                <button
                  key={half}
                  type="button"
                  onClick={() => handleHalfChange(half)}
                  disabled={loading}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold transition-colors ${
                    currentHalf === half
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {half}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Custom Event Detail (Optional)
          </label>
          <input
            type="text"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="e.g., Free kick awarded outside the penalty box"
            className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500"
          />
        </div>
      </div>
    </div>
  );
};

export default FootballScorerControl;
