import React, { useState } from 'react';
import { scoreService } from '../../services/scoreService';
import { RotateCcw, AlertOctagon, Plus, Clock } from 'lucide-react';

const BasketballScorerControl = ({ match, score, onScoreUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quarter, setQuarter] = useState(score?.currentQuarter || 'Q1');
  const [quarterTime, setQuarterTime] = useState(score?.quarterTimeLeft || '10:00');
  const [customDescription, setCustomDescription] = useState('');

  if (!match || !score) return null;

  const handleScorePoints = async (teamTarget, points) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        teamTarget,
        points: parseInt(points, 10),
        currentQuarter: quarter,
        quarterTimeLeft: quarterTime,
        description: customDescription || undefined
      };

      const res = await scoreService.updateScore(match.id, payload);
      if (res.success) {
        setCustomDescription('');
        if (onScoreUpdated) onScoreUpdated(res.data.score);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update score.');
    } finally {
      setLoading(false);
    }
  };

  const handleFoul = async (teamTarget) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        teamTarget,
        isFoul: true,
        currentQuarter: quarter,
        quarterTimeLeft: quarterTime,
        description: customDescription || undefined
      };

      const res = await scoreService.updateScore(match.id, payload);
      if (res.success) {
        setCustomDescription('');
        if (onScoreUpdated) onScoreUpdated(res.data.score);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update foul count.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuarterChange = async (newQuarter) => {
    setQuarter(newQuarter);
    setLoading(true);
    setError('');
    try {
      const payload = {
        action: 'QUARTER_CHANGE',
        currentQuarter: newQuarter,
        quarterTimeLeft: quarterTime,
        description: `Quarter changed to ${newQuarter}`
      };

      const res = await scoreService.updateScore(match.id, payload);
      if (res.success && onScoreUpdated) {
        onScoreUpdated(res.data.score);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change quarter.');
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

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-700/80 p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            Basketball Scoring Console
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {match.teamA.name} ({score.teamAPoints}) vs {match.teamB.name} ({score.teamBPoints})
          </p>
        </div>

        <button
          onClick={handleUndo}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo Last Play</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Point Scoring Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{match.teamA.name}</h4>
            <span className="text-xl font-mono font-black text-orange-400">{score.teamAPoints} PTS</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleScorePoints('A', 1)}
              disabled={loading}
              className="py-2.5 px-1 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 text-orange-200 border border-orange-500/40 font-mono font-bold text-xs active:scale-95 disabled:opacity-50"
            >
              +1 Free Throw
            </button>
            <button
              onClick={() => handleScorePoints('A', 2)}
              disabled={loading}
              className="py-2.5 px-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
            >
              +2 Field Goal
            </button>
            <button
              onClick={() => handleScorePoints('A', 3)}
              disabled={loading}
              className="py-2.5 px-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
            >
              +3 Downtown
            </button>
            <button
              onClick={() => handleFoul('A')}
              disabled={loading}
              className="py-2.5 px-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs active:scale-95 disabled:opacity-50"
            >
              Foul (+1)
            </button>
          </div>
        </div>

        {/* Team B */}
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{match.teamB.name}</h4>
            <span className="text-xl font-mono font-black text-orange-400">{score.teamBPoints} PTS</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleScorePoints('B', 1)}
              disabled={loading}
              className="py-2.5 px-1 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 text-orange-200 border border-orange-500/40 font-mono font-bold text-xs active:scale-95 disabled:opacity-50"
            >
              +1 Free Throw
            </button>
            <button
              onClick={() => handleScorePoints('B', 2)}
              disabled={loading}
              className="py-2.5 px-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
            >
              +2 Field Goal
            </button>
            <button
              onClick={() => handleScorePoints('B', 3)}
              disabled={loading}
              className="py-2.5 px-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
            >
              +3 Downtown
            </button>
            <button
              onClick={() => handleFoul('B')}
              disabled={loading}
              className="py-2.5 px-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs active:scale-95 disabled:opacity-50"
            >
              Foul (+1)
            </button>
          </div>
        </div>
      </div>

      {/* Quarter & Time Controls */}
      <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Active Quarter
            </label>
            <div className="grid grid-cols-5 gap-2">
              {['Q1', 'Q2', 'Q3', 'Q4', 'OT'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuarterChange(q)}
                  disabled={loading}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold transition-colors ${
                    quarter === q
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              Quarter Clock Remaining (MM:SS)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quarterTime}
                onChange={(e) => setQuarterTime(e.target.value)}
                placeholder="08:45"
                className="w-32 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-mono"
              />
              <button
                onClick={() => handleScorePoints('A', 0)}
                disabled={loading}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold"
              >
                Sync Clock
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Custom Play Description (Optional)
          </label>
          <input
            type="text"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="e.g., Step-back buzzer beater off the glass!"
            className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500"
          />
        </div>
      </div>
    </div>
  );
};

export default BasketballScorerControl;
