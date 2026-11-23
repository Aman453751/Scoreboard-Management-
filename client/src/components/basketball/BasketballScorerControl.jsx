import React, { useState } from 'react';
import { scoreService } from '../../services/scoreService';
import { RotateCcw, AlertOctagon, Plus, Clock } from 'lucide-react';

const BasketballScorerControl = ({ match, score, onScoreUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(score?.currentPeriod || score?.currentQuarter || 'Q1');
  const [gameClock, setGameClock] = useState(score?.gameClock || score?.quarterTimeLeft || '10:00');
  const [customDescription, setCustomDescription] = useState('');

  if (!match || !score) return null;

  const team1 = match.team1 || match.teamA;
  const team2 = match.team2 || match.teamB;

  const handleScorePoints = async (teamTarget, points) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        teamTarget,
        points: parseInt(points, 10),
        currentPeriod: period,
        currentQuarter: period,
        gameClock,
        quarterTimeLeft: gameClock,
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
        currentPeriod: period,
        currentQuarter: period,
        gameClock,
        quarterTimeLeft: gameClock,
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

  const handlePeriodChange = async (newPeriod) => {
    setPeriod(newPeriod);
    setLoading(true);
    setError('');
    try {
      const payload = {
        action: 'QUARTER_CHANGE',
        currentPeriod: newPeriod,
        currentQuarter: newPeriod,
        gameClock,
        quarterTimeLeft: gameClock,
        description: `Period changed to ${newPeriod}`
      };

      const res = await scoreService.updateScore(match.id, payload);
      if (res.success && onScoreUpdated) {
        onScoreUpdated(res.data.score);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change period.');
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

  const team1Score = score.team1Score ?? score.teamAPoints ?? 0;
  const team2Score = score.team2Score ?? score.teamBPoints ?? 0;

  return (
    <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#252a37]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span>
            <span>Basketball Sideline Scoring Console</span>
          </h3>
          <p className="text-xs text-[#8c909f] mt-0.5">
            {team1.name} ({team1Score}) vs {team2.name} ({team2Score})
          </p>
        </div>

        <button
          onClick={handleUndo}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold active:scale-95 transition-all disabled:opacity-50"
          title="Rollback last point or foul"
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

      {/* Period & Clock Controls Bar */}
      <div className="p-3 rounded-lg bg-[#090e1a] border border-[#252a37] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-[#8c909f] font-semibold">Game Clock:</label>
          <input
            type="text"
            value={gameClock}
            onChange={(e) => setGameClock(e.target.value)}
            className="w-20 bg-[#1a1f2c] border border-[#252a37] rounded px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-[#4d8eff]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['Q1', 'Q2', 'Half', 'Q3', 'Q4', 'OT'].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              disabled={loading}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                period === p
                  ? 'bg-[#4d8eff] text-[#00285d]'
                  : 'bg-[#1a1f2c] text-[#8c909f] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Team Scoring Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team 1 Controls */}
        <div className="p-4 rounded-xl bg-[#090e1a] border border-[#252a37] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{team1.name}</h4>
            <span className="text-lg font-mono font-bold text-[#4cd7f6]">{team1Score} PTS</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleScorePoints('team1', 1)}
              disabled={loading}
              className="py-2.5 rounded bg-[#252a37] hover:bg-[#343947] text-white font-mono font-bold text-xs shadow active:scale-95"
            >
              +1 Free Throw
            </button>
            <button
              onClick={() => handleScorePoints('team1', 2)}
              disabled={loading}
              className="py-2.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-mono font-bold text-xs shadow active:scale-95"
            >
              +2 Field Goal
            </button>
            <button
              onClick={() => handleScorePoints('team1', 3)}
              disabled={loading}
              className="py-2.5 rounded bg-[#4edea3] hover:brightness-110 text-[#003824] font-mono font-bold text-xs shadow active:scale-95"
            >
              +3 Downtown
            </button>
          </div>

          <div className="pt-2 border-t border-[#1a1f2c]">
            <button
              onClick={() => handleFoul('team1')}
              disabled={loading}
              className="w-full py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 active:scale-95"
            >
              Log Team Foul
            </button>
          </div>
        </div>

        {/* Team 2 Controls */}
        <div className="p-4 rounded-xl bg-[#090e1a] border border-[#252a37] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">{team2.name}</h4>
            <span className="text-lg font-mono font-bold text-[#4cd7f6]">{team2Score} PTS</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleScorePoints('team2', 1)}
              disabled={loading}
              className="py-2.5 rounded bg-[#252a37] hover:bg-[#343947] text-white font-mono font-bold text-xs shadow active:scale-95"
            >
              +1 Free Throw
            </button>
            <button
              onClick={() => handleScorePoints('team2', 2)}
              disabled={loading}
              className="py-2.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-mono font-bold text-xs shadow active:scale-95"
            >
              +2 Field Goal
            </button>
            <button
              onClick={() => handleScorePoints('team2', 3)}
              disabled={loading}
              className="py-2.5 rounded bg-[#4edea3] hover:brightness-110 text-[#003824] font-mono font-bold text-xs shadow active:scale-95"
            >
              +3 Downtown
            </button>
          </div>

          <div className="pt-2 border-t border-[#1a1f2c]">
            <button
              onClick={() => handleFoul('team2')}
              disabled={loading}
              className="w-full py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 active:scale-95"
            >
              Log Team Foul
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketballScorerControl;
