import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Activity, Heart, Shield, Radio, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Omni<span className="text-blue-500">Score</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time Sports Scoreboard & College Tournament Management System powered by React, Node.js, Express, Socket.IO, and Prisma ORM.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live WebSocket Sync Active
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/scoreboard" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-500" />
                  Live Match Center
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="hover:text-blue-400 transition-colors">
                  Tournaments & Cups
                </Link>
              </li>
              <li>
                <Link to="/teams" className="hover:text-blue-400 transition-colors">
                  Teams & Player Rosters
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-blue-400 transition-colors">
                  Match Schedule
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-blue-400 transition-colors">
                  Points Table & Standings
                </Link>
              </li>
            </ul>
          </div>

          {/* Sports Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Sports Covered
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>T20 & Collegiate Cricket</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Football & Soccer League</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                <span>Basketball Championship (Q1-Q4)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Multi-Sport Tournament Brackets</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack / College Info */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Project Architecture
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">React 18</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">Vite</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">Tailwind</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">Node.js</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">Express</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">Socket.IO</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">Prisma ORM</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">SQLite</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">JWT Auth</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Full Stack Development Final Year Project
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} OmniScore Sports Scoreboard Management System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Role-Based Access Control: Admin | Scorer | Viewer
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
