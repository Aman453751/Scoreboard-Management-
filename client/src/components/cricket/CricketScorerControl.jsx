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

  const team1 = match.team1 || match.teamA;
  const team2 = match.team2 || match.teamB;
  const team1Id = match.team1Id || match.teamAId || team1.id;
  const team2Id = match.team2Id || match.teamBId || team2.id;

  const isTeam1Batting = (score.battingTeamId || team1Id) === team1Id;
  const battingTeam = isTeam1Batting ? team1 : team2;
  const bowlingTeam = isTeam1Batting ? team2 : team1;

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
      const newBattingTeamId = isTeam1Batting ? team2Id : team1Id;
      const team1ScoreRuns = score.team1Runs ?? score.teamARuns ?? 0;
      const team2ScoreRuns = score.team2Runs ?? score.teamBRuns ?? 0;

      const targetRuns = newInning === 2
        ? (isTeam1Batting ? team1ScoreRuns + 1 : team2ScoreRuns + 1)
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
    <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header with Undo and Innings (Stitch Exact Control Bar) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#252a37]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span>
            <span>Cricket Sideline Scoring Console</span>
          </h3>
          <p className="text-xs text-[#8c909f] mt-0.5">
            Batting: <strong className="text-[#4cd7f6]">{battingTeam.name}</strong> | Inning: <span className="font-mono text-white">{score.currentInning}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Instant Undo Protocol (Stitch Spec) */}
          <button
            onClick={handleUndo}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold active:scale-95 transition-all disabled:opacity-50"
            title="Rollback last play or score update"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Instant Undo</span>
          </button>

          <button
            onClick={handleSwitchInnings}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#252a37] hover:bg-[#343947] text-[#dee2f4] border border-[#343947] text-xs font-semibold active:scale-95 transition-all"
          >
            <span>Switch Innings</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Primary Scoring Action Buttons */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#8c909f] uppercase tracking-wider block">
          Ball Outcome (Touch to Log Ball)
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {['0', '1', '2', '3', '4', '6'].map((runs) => (
            <button
              key={runs}
              onClick={() => handleScoreBall(runs, false)}
              disabled={loading}
              className={`h-12 rounded font-mono font-bold text-base transition-all active:scale-95 flex items-center justify-center ${
                runs === '4' || runs === '6'
                  ? 'bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d]'
                  : runs === '0'
                  ? 'bg-[#252a37] hover:bg-[#343947] text-[#c2c6d6]'
                  : 'bg-[#161b28] hover:bg-[#252a37] text-white border border-[#252a37]'
              }`}
            >
              {runs === '0' ? 'Dot' : `+${runs}`}
            </button>
          ))}

          {/* Wicket Button */}
          <button
            onClick={() => handleScoreBall(0, true)}
            disabled={loading}
            className="col-span-2 sm:col-span-1 h-12 rounded bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-base transition-all active:scale-95 flex items-center justify-center shadow"
          >
            Wicket!
          </button>
        </div>
      </div>

      {/* Extras Selection Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#252a37]">
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-[#8c909f] mb-1">Extra Type</label>
          <select
            value={selectedExtra}
            onChange={(e) => setSelectedExtra(e.target.value)}
            className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
          >
            <option value="NONE">No Extra (Legal Delivery)</option>
            <option value="WIDE">Wide (+1 run, ball not counted)</option>
            <option value="NO_BALL">No Ball (+1 run, free hit)</option>
            <option value="BYE">Bye</option>
            <option value="LEG_BYE">Leg Bye</option>
          </select>
        </div>

        {selectedExtra !== 'NONE' && (
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-[#8c909f] mb-1">Extra Runs</label>
            <input
              type="number"
              min="0"
              value={extraRuns}
              onChange={(e) => setExtraRuns(e.target.value)}
              className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
            />
          </div>
        )}

        <div className={selectedExtra !== 'NONE' ? 'sm:col-span-6' : 'sm:col-span-8'}>
          <label className="block text-[11px] font-semibold text-[#8c909f] mb-1">Play Description (Optional)</label>
          <input
            type="text"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="e.g. Driven through covers for boundary"
            className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
          />
        </div>
      </div>
    </div>
  );
};

export default CricketScorerControl;
