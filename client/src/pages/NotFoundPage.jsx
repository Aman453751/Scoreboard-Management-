import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white font-mono tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Out of Bounds! Page Not Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The scoreboard page or tournament bracket you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Arena</span>
          </Link>
          <Link
            to="/scoreboard"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Live Scores
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
