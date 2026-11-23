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
import { formatDateTime, getStatusBadgeClass, getSportBadgeClass } from '../utils/formatters';

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
    return <div className="text-center py-20 text-slate-500 text-xs">Loading fixture details...</div>;
  }

  if (!match) {
    return <div className="text-center py-20 text-slate-400 text-sm">Match not found.</div>;
  }

  const { teamA, teamB, score, matchEvents = [] } = match;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <Link
          to="/matches"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Match Overview & Statistics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {match.tournament?.name} • Fixture #{match.id}
          </p>
        </div>
      </div>

      {/* Match Summary Box */}
      <div className="rounded-3xl bg-navy-900 border border-slate-700/80 p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${getSportBadgeClass(match.sportType)}`}>
              {match.sportType}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(match.status)}`}>
              {match.status}
            </span>
          </div>

          <Link
            to={`/scoreboard/${match.id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Open Real-Time Scoreboard</span>
          </Link>
        </div>

        {/* Teams Matchup Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 my-8">
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <img
              src={teamA.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${teamA.name}`}
              alt={teamA.name}
              className="w-16 h-16 rounded-2xl bg-slate-800 p-1 border border-slate-700 object-cover"
            />
            <h3 className="text-lg font-bold text-white">{teamA.name}</h3>
            <p className="text-xs text-slate-400">{teamA.college}</p>
          </div>

          {/* Central Score */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {match.sportType === 'CRICKET' && score
                ? `${score.teamARuns}/${score.teamAWickets} vs ${score.teamBRuns}/${score.teamBWickets}`
                : match.sportType === 'FOOTBALL' && score
                ? `${score.teamAGoals} - ${score.teamBGoals}`
                : match.sportType === 'BASKETBALL' && score
                ? `${score.teamAPoints} - ${score.teamBPoints}`
                : 'VS'}
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-2 font-mono">
              {match.currentPeriod || match.status}
            </span>
            {match.resultSummary && (
              <span className="text-xs font-bold text-emerald-400 mt-1">
                {match.resultSummary}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <img
              src={teamB.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${teamB.name}`}
              alt={teamB.name}
              className="w-16 h-16 rounded-2xl bg-slate-800 p-1 border border-slate-700 object-cover"
            />
            <h3 className="text-lg font-bold text-white">{teamB.name}</h3>
            <p className="text-xs text-slate-400">{teamB.college}</p>
          </div>
        </div>

        {/* Fixture Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{formatDateTime(match.matchDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>{match.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            <span>Scorer: {match.scorer?.name || 'Assigned Official'}</span>
          </div>
        </div>
      </div>

      {/* Team Rosters Lineups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A Roster */}
        <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>{teamA.name} Squad</span>
          </h3>
          <div className="space-y-2">
            {teamA.players?.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850/60 text-xs"
              >
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <span className="font-mono text-blue-400 font-bold">{p.jerseyNumber ? `#${p.jerseyNumber}` : ''}</span>
                  <span>{p.name}</span>
                  {p.isCaptain && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      C
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[11px]">{p.role || 'Player'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team B Roster */}
        <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{teamB.name} Squad</span>
          </h3>
          <div className="space-y-2">
            {teamB.players?.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850/60 text-xs"
              >
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <span className="font-mono text-indigo-400 font-bold">{p.jerseyNumber ? `#${p.jerseyNumber}` : ''}</span>
                  <span>{p.name}</span>
                  {p.isCaptain && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      C
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[11px]">{p.role || 'Player'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commentary & Event Logs */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Complete Event Log & Highlights ({matchEvents.length})</span>
        </h3>

        {matchEvents.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No events recorded for this match yet.</p>
        ) : (
          <div className="space-y-2.5">
            {matchEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 shrink-0">
                    {evt.period || 'Event'}
                  </span>
                  <p className="text-slate-200">{evt.description}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
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
