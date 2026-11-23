import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchService } from '../services/matchService';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Users,
  Activity,
  Radio,
  ArrowLeft,
  Shield,
  ArrowRight
} from 'lucide-react';
import LiveBadge from '../components/common/LiveBadge';
import { formatDateTime, formatCricketOvers } from '../utils/formatters';

const MatchDetailsPage = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await matchService.getById(id);
        if (res.success) {
          setMatch(res.data.match);
        }
      } catch (err) {
        console.error('Error fetching match:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-xs font-mono text-[#8c909f]">
        Loading fixture overview...
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20 text-sm text-[#8c909f]">
        <p>Match record not found.</p>
        <Link to="/matches" className="mt-4 inline-block text-[#4cd7f6] font-semibold">
          ← Back to Matches
        </Link>
      </div>
    );
  }

  const team1 = match.team1 || match.teamA;
  const team2 = match.team2 || match.teamB;
  const score = match.score || match.cricketScore || match.footballScore || match.basketballScore;
  const matchEvents = match.matchEvents || match.events || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#252a37]">
        <Link
          to="/matches"
          className="p-2 rounded bg-[#1a1f2c] hover:bg-[#252a37] text-[#c2c6d6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Match Overview & Statistics
          </h1>
          <p className="text-xs text-[#8c909f] mt-0.5">
            {match.tournament?.name} • Fixture #{match.id}
          </p>
        </div>
      </div>

      {/* Match Summary Box (Stitch Card) */}
      <div className="rounded-xl bg-[#161b28] border border-[#252a37] p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#252a37]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-[#252a37] text-[#4cd7f6] uppercase tracking-wider">
              {match.sportType}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded font-mono font-bold text-[11px] uppercase ${
                match.status === 'LIVE'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : match.status === 'COMPLETED'
                  ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30'
                  : 'bg-[#252a37] text-[#8c909f]'
              }`}
            >
              {match.status}
            </span>
          </div>

          <Link
            to={`/scoreboard/${match.id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow active:scale-95 transition-all"
          >
            <Radio className="w-4 h-4" />
            <span>Open Real-Time Scoreboard</span>
          </Link>
        </div>

        {/* Teams Matchup Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 my-4">
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-xl shadow">
              {team1?.name?.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">{team1?.name}</h3>
            <p className="text-xs text-[#8c909f]">{team1?.department || team1?.college}</p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#090e1a] border border-[#252a37]">
            <div className="flex items-center gap-4">
              <span className="font-score-display text-4xl sm:text-5xl font-black text-white font-mono tabular-nums">
                {match.sportType === 'CRICKET' && score
                  ? `${score.team1Runs ?? score.teamARuns ?? 0}/${score.team1Wickets ?? score.teamAWickets ?? 0}`
                  : match.sportType === 'FOOTBALL' && score
                  ? score.team1Goals ?? score.teamAGoals ?? 0
                  : match.sportType === 'BASKETBALL' && score
                  ? score.team1Score ?? score.teamAPoints ?? 0
                  : '-'}
              </span>
              <span className="text-xl font-bold text-[#8c909f] font-mono">:</span>
              <span className="font-score-display text-4xl sm:text-5xl font-black text-white font-mono tabular-nums">
                {match.sportType === 'CRICKET' && score
                  ? `${score.team2Runs ?? score.teamBRuns ?? 0}/${score.team2Wickets ?? score.teamBWickets ?? 0}`
                  : match.sportType === 'FOOTBALL' && score
                  ? score.team2Goals ?? score.teamBGoals ?? 0
                  : match.sportType === 'BASKETBALL' && score
                  ? score.team2Score ?? score.teamBPoints ?? 0
                  : '-'}
              </span>
            </div>
            {match.sportType === 'CRICKET' && score && (
              <span className="mt-2 text-[11px] font-mono text-[#8c909f]">
                Overs: {formatCricketOvers(score.team1Balls ?? score.teamABalls ?? 0)} vs {formatCricketOvers(score.team2Balls ?? score.teamBBalls ?? 0)}
              </span>
            )}
            <span className="mt-1 text-[11px] font-mono font-semibold text-[#4cd7f6] uppercase">
              {match.status}
            </span>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#252a37] text-[#c2c6d6] flex items-center justify-center font-bold text-xl shadow">
              {team2?.name?.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">{team2?.name}</h3>
            <p className="text-xs text-[#8c909f]">{team2?.department || team2?.college}</p>
          </div>
        </div>

        {/* Fixture Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#252a37] text-xs text-[#c2c6d6]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4cd7f6]" />
            <span>{formatDateTime(match.matchDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#4edea3]" />
            <span>{match.venue || 'Campus Arena'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#adc6ff]" />
            <Link to={`/tournaments/${match.tournamentId}`} className="text-[#4cd7f6] hover:underline">
              {match.tournament?.name}
            </Link>
          </div>
        </div>
      </div>

      {/* Match Events Timeline */}
      <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#4cd7f6]" />
          <span>Play-by-Play Event Log</span>
        </h3>

        {matchEvents.length === 0 ? (
          <p className="text-xs text-[#8c909f] italic">
            No events logged for this fixture yet.
          </p>
        ) : (
          <div className="space-y-2">
            {matchEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#090e1a] border border-[#252a37] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#252a37] text-[#dee2f4]">
                    {evt.eventType}
                  </span>
                  <span className="text-white font-medium">{evt.description}</span>
                </div>
                <span className="font-mono text-[#8c909f] text-[11px]">
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

export default MatchDetailsPage;
