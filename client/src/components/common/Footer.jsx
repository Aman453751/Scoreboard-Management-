import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Activity, Shield, ExternalLink } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const Footer = () => {
  const { isConnected } = useSocket();

  return (
    <footer className="bg-[#090e1a] border-t border-[#252a37] text-[#8c909f] text-xs pb-20 md:pb-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 space-y-6">
        {/* Operational Status Pill Strip (Stitch specification) */}
        <div className="p-3 rounded-lg bg-[#0e131f] border border-[#1a1f2c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-[#4edea3]' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-[#4edea3]' : 'bg-amber-400'}`}></span>
            </span>
            <span className="font-label-sm text-[12px] text-[#dee2f4]">
              {isConnected ? 'WebSocket v2.4 Live' : 'WebSocket Reconnecting...'}
            </span>
          </div>
          <span className="font-stat-mono text-[11px] text-[#4edea3] font-mono">
            {isConnected ? '0 pkt drop • <100ms sync' : 'standby'}
          </span>
        </div>

        {/* Desktop Grid Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-2">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#1a1f2c] border border-[#252a37] flex items-center justify-center text-[#4cd7f6]">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold text-[#dee2f4] tracking-tight">
                Omni<span className="text-[#4cd7f6]">Score</span>
              </span>
            </div>
            <p className="text-xs text-[#8c909f] leading-relaxed">
              Centralized sports scoreboard & tournament operations system engineered for college athletics, official scorers, and live campus fixtures.
            </p>
          </div>

          {/* Quick Operations Links */}
          <div>
            <h4 className="text-[11px] font-bold text-[#dee2f4] uppercase tracking-wider mb-3">
              Operations & Center
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/scoreboard" className="hover:text-[#dee2f4] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Live Match Center
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="hover:text-[#dee2f4] transition-colors">
                  Tournaments & Brackets
                </Link>
              </li>
              <li>
                <Link to="/teams" className="hover:text-[#dee2f4] transition-colors">
                  Departments & Teams
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-[#dee2f4] transition-colors">
                  Fixtures & Schedules
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-[#dee2f4] transition-colors">
                  Points Table & Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Multi-Sport Rules */}
          <div>
            <h4 className="text-[11px] font-bold text-[#dee2f4] uppercase tracking-wider mb-3">
              Scoring Protocols
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                <span>Cricket T20 (Runs, Overs, NRR, Target Chase)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] shrink-0"></span>
                <span>Football (Goals, Halves, Clock, Cards, GD)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] shrink-0"></span>
                <span>Basketball (1-2-3 PTS, Quarters, Fouls)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#adc6ff] shrink-0"></span>
                <span>Instant Scorer Undo (State Rollback)</span>
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div>
            <h4 className="text-[11px] font-bold text-[#dee2f4] uppercase tracking-wider mb-3">
              System Telemetry
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['React 18', 'Vite', 'Tailwind', 'Node.js', 'Express', 'Socket.IO', 'Prisma ORM', 'SQLite'].map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161b28] border border-[#252a37] text-[#c2c6d6]"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#8c909f] mt-3">
              Built to collegiate athletics standards with zero-latency updates and multi-device referee consoles.
            </p>
          </div>
        </div>

        {/* Bottom copyright line matching Stitch */}
        <div className="pt-4 border-t border-[#1a1f2c] flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-[11px]">
          <p>© OmniScore Collegiate Athletics OS. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[#4cd7f6]">
            <Link to="/scoreboard" className="hover:underline">Referee Manual</Link>
            <span>•</span>
            <Link to="/tournaments" className="hover:underline">Rulebooks</Link>
            <span>•</span>
            <Link to="/matches" className="hover:underline">Support Desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
