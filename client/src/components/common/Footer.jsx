import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Radio, Shield, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                Omni<span className="text-blue-500">Score</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centralized sports scoreboard & tournament management system designed for collegiate athletics, official scorers, and campus tournament brackets.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Socket.IO Live Gateway Active</span>
            </div>
          </div>

          {/* Core Operations Links */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-3">
              Operations & Center
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/scoreboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Live Match Center
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="hover:text-white transition-colors">
                  Tournaments & Championships
                </Link>
              </li>
              <li>
                <Link to="/teams" className="hover:text-white transition-colors">
                  Departments & Team Rosters
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-white transition-colors">
                  Match Schedule & Fixtures
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-white transition-colors">
                  Standings & Points Table
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">
                  Historical Results Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Multi-Sport Rules */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-3">
              Scoring Protocols
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                <span>Cricket T20 (Runs, Overs, NRR, Target Chase)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Football (Goals, Halves, Clock, Cards, GD)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                <span>Basketball (1-2-3 PTS, Quarters, Fouls)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                <span>Snapshot-Based State Rollback (Undo)</span>
              </li>
            </ul>
          </div>

          {/* Software Architecture & Credentials */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-3">
              Technical Foundation
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['React 18', 'Vite', 'Node.js', 'Express', 'Socket.IO', 'Prisma ORM', 'SQLite', 'JWT RBAC'].map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono">
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Role-Based Access Control enforced on all endpoints for Administrators, Official Scorers, and Student Spectators.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} OmniScore Athletic Platform. Production Sports Management System.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">REST API & WebSocket Broadcasts</span>
            <span>•</span>
            <span className="text-slate-400">Strict Data Persistence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
