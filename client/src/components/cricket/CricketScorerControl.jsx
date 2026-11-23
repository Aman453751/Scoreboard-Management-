import React, { useState } from 'react';
import { scoreService } from '../../services/scoreService';
import { RotateCcw, AlertOctagon, CheckCircle2, ChevronRight, Play, Check } from 'lucide-react';

const CricketScorerControl = ({ match, score, onScoreUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedExtra, setSelectedExtra] = useState('NONE');
  const [extraRuns, setExtraRuns] = useState(0);

  if (!match || !score) return null;

  const isTeamABatting = (score.battingTeamId || match.teamAId) === match.teamAId;
  const battingTeam = isTeamABatting ? match.teamA : match.teamB;
  const bowlingTeam = isTeamABatting ? match.teamB : match.teamA;

  const handleScoreBall = async (runs, isWicket = false) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        runs: parseInt(runs, 10),
        isWicket: Boolean(isWicket),
        extraType: selectedExtra,
        extraRuns: parseInt(extraRuns, 10) || 0,
        description: customDescription || undefined
      };

      const res = await scoreService.updateScore(match.id, payload);
      if (res.success) {
        setCustomDescription('');
        setSelectedExtra('NONE');
        setExtraRuns(0);
        if (onScoreUpdated) onScoreUpdated(res.data.score);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update score.');
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

  const handleSwitchInnings = async () => {
    setLoading(true);
    setError('');
    try {
      const newInning = score.currentInning === 1 ? 2 : 1;
      const newBattingTeamId = isTeamABatting ? match.teamBId : match.teamAId;
      // Calculate target if switching to 2nd inning
      const targetRuns = newInning === 2
        ? (isTeamABatting ? score.teamARuns + 1 : score.teamBRuns + 1)
        : null;

      const payload = {
        currentInning: newInning,
        battingTeamId: newBattingTeamId,
        targetRuns: targetRuns,
        customEvent: 'PERIOD_CHANGE',
        description: `Innings change: ${newInning === 2 ? '2nd Inning begins' : '1st Inning'}. Target is ${targetRuns || 'N/A'}`
      };

      const res = await scoreService.updateScore(match.id, payload);
      if (res.success && onScoreUpdated) {
        onScoreUpdated(res.data.score);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to switch innings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-700/80 p-6 space-y-6 shadow-xl">
      {/* Header with Undo and Innings */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            Cricket Scoring Console
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Batting: <strong className="text-blue-400 font-semibold">{battingTeam.name}</strong> |
            Inning: <span className="font-mono">{score.currentInning}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all active:scale-95 disabled:opacity-50"
            title="Undo the last scored ball or event"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo Last Action</span>
          </button>

          <button
            onClick={handleSwitchInnings}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            Switch to {score.currentInning === 1 ? '2nd Inning' : '1st Inning'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Scoring Grid: Runs Per Ball */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Record Standard Runs (Legal Ball)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: '0 Dot', runs: 0, color: 'bg-slate-800 hover:bg-slate-700 text-slate-200' },
            { label: '1 Run', runs: 1, color: 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-700/50' },
            { label: '2 Runs', runs: 2, color: 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-700/50' },
            { label: '3 Runs', runs: 3, color: 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-700/50' },
            { label: '4 FOUR', runs: 4, color: 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-bold' },
            { label: '6 SIX', runs: 6, color: 'bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold' }
          ].map((btn) => (
            <button
              key={btn.runs}
              onClick={() => handleScoreBall(btn.runs, false)}
              disabled={loading}
              className={`py-3.5 px-2 rounded-xl text-center font-mono font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 ${btn.color}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dismissals / Wicket Action */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-rose-400 mb-2 uppercase tracking-wider">
          Wicket Dismissal
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleScoreBall(0, true)}
            disabled={loading}
            className="py-3 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>OUT (0 Runs)</span>
          </button>
          <button
            onClick={() => handleScoreBall(1, true)}
            disabled={loading}
            className="py-3 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>OUT + 1 Run (Run Out)</span>
          </button>
          <button
            onClick={() => handleScoreBall(2, true)}
            disabled={loading}
            className="py-3 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>OUT + 2 Runs</span>
          </button>
        </div>
      </div>

      {/* Extras Selection & Delivery Options */}
      <div className="pt-2 border-t border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Extra Ball Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['NONE', 'WIDE', 'NO_BALL', 'BYE', 'LEG_BYE'].map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() => setSelectedExtra(ext)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                    selectedExtra === ext
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {ext.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Commentary / Description (Optional)
            </label>
            <input
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g., Slashed over third man for a double"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketScorerControl;
