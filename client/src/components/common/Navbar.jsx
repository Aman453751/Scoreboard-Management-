import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  Trophy,
  Activity,
  Calendar,
  Users,
  Award,
  History,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  Search,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isScorer } = useAuth();
  const { isConnected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Live Scores', path: '/scoreboard', icon: Activity, badge: 'LIVE' },
    { name: 'Tournaments', path: '/tournaments', icon: Trophy },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Matches', path: '/matches', icon: Calendar },
    { name: 'Leaderboard', path: '/leaderboard', icon: Award },
    { name: 'History', path: '/history', icon: History }
  ];

  const getDashboardPath = () => {
    if (isAdmin) return '/dashboard/admin';
    if (isScorer) return '/dashboard/scorer';
    return '/dashboard/student';
  };

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Home';
    if (location.pathname.startsWith('/scoreboard')) return 'Live Scores';
    if (location.pathname.startsWith('/tournaments')) return 'Tournaments';
    if (location.pathname.startsWith('/teams')) return 'Teams';
    if (location.pathname.startsWith('/matches')) return 'Matches';
    if (location.pathname.startsWith('/leaderboard')) return 'Leaderboard';
    if (location.pathname.startsWith('/history')) return 'Match History';
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard';
    if (location.pathname === '/login') return 'Login';
    if (location.pathname === '/register') return 'Register';
    return 'OmniScore';
  };

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-50 bg-[#0e131f]/90 backdrop-blur-xl border-b border-[#252a37] shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: Mobile menu toggle + Brand Logo */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Navigation Menu"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-[#c2c6d6] hover:text-[#dee2f4] hover:bg-[#1a1f2c] transition-colors md:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                <div className="w-8 h-8 rounded bg-[#1a1f2c] border border-[#252a37] flex items-center justify-center text-[#4cd7f6] group-hover:border-[#4cd7f6]/50 transition-colors shadow-sm">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-[10px] text-[#4cd7f6] uppercase tracking-widest leading-none font-semibold">
                    OmniScore
                  </span>
                  <span className="text-sm font-bold text-[#dee2f4] truncate leading-tight group-hover:text-white">
                    {getPageTitle()}
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1 ml-6">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#4d8eff]/15 text-[#adc6ff] border border-[#4d8eff]/30'
                          : 'text-[#c2c6d6] hover:text-[#dee2f4] hover:bg-[#1a1f2c]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 opacity-80" />
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Telemetry / Live Indicator + Search + User controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Live Status Badge */}
              <Link
                to="/scoreboard"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ffb4ab]/15 border border-red-500/30 text-red-400 font-label-sm text-[11px] tracking-wider uppercase"
                title="View Live Matches"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="font-bold">Live</span>
              </Link>

              {/* Socket sync telemetry */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border ${
                  isConnected
                    ? 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
                title={isConnected ? 'WebSocket stream active' : 'Connecting to socket gateway...'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#4edea3] animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-bold text-[10px]">{isConnected ? 'SYNCED' : 'OFFLINE'}</span>
              </div>

              {/* Search button */}
              <Link
                to="/matches"
                aria-label="Search Matches"
                className="w-9 h-9 rounded flex items-center justify-center text-[#c2c6d6] hover:text-[#dee2f4] hover:bg-[#1a1f2c] transition-colors"
                title="Search fixtures and scores"
              >
                <Search className="w-4 h-4" />
              </Link>

              {/* Auth / Profile Area */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded bg-[#1a1f2c] hover:bg-[#252a37] border border-[#252a37] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#4d8eff] text-[#00285d] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-xs font-bold text-[#dee2f4] truncate max-w-[100px]">
                        {user?.name}
                      </div>
                      <span className="text-[10px] text-[#4cd7f6] uppercase font-semibold block -mt-0.5">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8c909f]" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#1a1f2c] border border-[#252a37] shadow-2xl py-1.5 z-50 animate-slide-up">
                      <div className="px-4 py-2 border-b border-[#252a37]">
                        <p className="text-[10px] text-[#8c909f] uppercase tracking-wider font-semibold">Signed In As</p>
                        <p className="text-xs font-bold text-[#dee2f4] truncate mt-0.5">{user?.name}</p>
                        <p className="text-[11px] text-[#c2c6d6] truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/30">
                          ROLE: {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#dee2f4] hover:bg-[#252a37] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#4cd7f6]" />
                          <span>Console Dashboard</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin/users"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#dee2f4] hover:bg-[#252a37] transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4 text-[#4edea3]" />
                            <span>User Management</span>
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#dee2f4] hover:bg-[#252a37] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#adc6ff]" />
                          <span>Account Settings</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-[#252a37]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#ffb4ab] hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded text-xs font-semibold text-[#dee2f4] hover:bg-[#1a1f2c] border border-transparent hover:border-[#252a37] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 rounded text-xs font-semibold bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] transition-all shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#161b28] border-b border-[#252a37] px-4 py-4 space-y-1 animate-slide-up">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#4d8eff]/15 text-[#adc6ff] border border-[#4d8eff]/30'
                      : 'text-[#c2c6d6] hover:text-[#dee2f4] hover:bg-[#1a1f2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 opacity-80" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-red-500/20 text-red-400">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="pt-2 mt-2 border-t border-[#252a37] space-y-1">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-semibold text-[#4cd7f6] hover:bg-[#1a1f2c]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Console Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-semibold text-[#ffb4ab] hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 mt-2 border-t border-[#252a37] grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center rounded text-xs font-semibold text-[#dee2f4] bg-[#1a1f2c] border border-[#252a37]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center rounded text-xs font-semibold bg-[#4d8eff] text-[#00285d]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Stich-exact design) */}
      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#0e131f]/95 backdrop-blur-xl border-t border-[#252a37] shadow-[0_-2px_12px_rgba(0,0,0,0.6)] md:hidden">
        <div className="h-16 px-2 flex items-stretch justify-around">
          <Link
            to="/"
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname === '/' ? 'text-[#4cd7f6] font-semibold' : 'text-[#c2c6d6] hover:text-[#dee2f4]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="font-label-sm text-[11px]">Home</span>
          </Link>

          <Link
            to="/scoreboard"
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors relative ${
              location.pathname.startsWith('/scoreboard') ? 'text-[#4cd7f6] font-semibold' : 'text-[#c2c6d6] hover:text-[#dee2f4]'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">sensors</span>
              <span className="absolute -top-1 -right-3.5 px-1 py-0.2 rounded bg-red-500 text-white font-label-sm text-[8px] font-bold leading-none tracking-tight">
                LIVE
              </span>
            </div>
            <span className="font-label-sm text-[11px]">Live</span>
          </Link>

          <Link
            to="/tournaments"
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname.startsWith('/tournaments') ? 'text-[#4cd7f6] font-semibold' : 'text-[#c2c6d6] hover:text-[#dee2f4]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">emoji_events</span>
            <span className="font-label-sm text-[11px]">Tournaments</span>
          </Link>

          <Link
            to="/teams"
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname.startsWith('/teams') ? 'text-[#4cd7f6] font-semibold' : 'text-[#c2c6d6] hover:text-[#dee2f4]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">shield</span>
            <span className="font-label-sm text-[11px]">Teams</span>
          </Link>

          <Link
            to={isAuthenticated ? getDashboardPath() : '/login'}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              location.pathname.startsWith('/dashboard') || location.pathname === '/login' ? 'text-[#4cd7f6] font-semibold' : 'text-[#c2c6d6] hover:text-[#dee2f4]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">grid_view</span>
            <span className="font-label-sm text-[11px]">{isAuthenticated ? 'Console' : 'Login'}</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
