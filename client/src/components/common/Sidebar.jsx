import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Calendar,
  Radio,
  Award,
  History,
  UserCheck,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin, isScorer, logout } = useAuth();

  const getDashboardHome = () => {
    if (isAdmin) return '/dashboard/admin';
    if (isScorer) return '/dashboard/scorer';
    return '/dashboard/student';
  };

  const navItems = [
    {
      label: 'Main Dashboard',
      path: getDashboardHome(),
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SCORER', 'VIEWER']
    },
    {
      label: 'Live Scoreboard',
      path: '/scoreboard',
      icon: Radio,
      badge: 'LIVE',
      roles: ['ADMIN', 'SCORER', 'VIEWER']
    },
    {
      label: 'Tournaments',
      path: '/tournaments',
      icon: Trophy,
      roles: ['ADMIN', 'SCORER', 'VIEWER']
    },
    {
      label: 'Teams & Rosters',
      path: '/teams',
      icon: Users,
      roles: ['ADMIN', 'SCORER', 'VIEWER']
    },
    {
      label: 'Match Schedule',
      path: '/matches',
      icon: Calendar,
      roles: ['ADMIN', 'SCORER', 'VIEWER']
    },
    {
      label: 'Tournament Standings',
      path: '/leaderboard',
      icon: Award,
      roles: ['ADMIN', 'SCORER', 'VIEWER']
    },
    {
      label: 'Match History',
      path: '/history',
      icon: History,
      roles: ['ADMIN', 'SCORER', 'VIEWER']
    },
    {
      label: 'User Management',
      path: '/dashboard/users',
      icon: UserCheck,
      roles: ['ADMIN']
    },
    {
      label: 'My Account',
      path: '/profile',
      icon: User,
      roles: ['ADMIN', 'SCORER', 'VIEWER']
    }
  ];

  const allowedItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'VIEWER')
  );

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* User Quick Info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-10 h-10 rounded-full bg-slate-800 border border-blue-500/40 object-cover"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">{user?.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                isAdmin
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : isScorer
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="p-3 flex-1 space-y-1">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/30 text-rose-300 animate-pulse">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
