/**
 * Format total balls into cricket overs (e.g., 14 balls -> "2.2")
 */
export const formatCricketOvers = (balls) => {
  if (!balls || balls < 0) return '0.0';
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls}`;
};

/**
 * Calculate Run Rate: (Runs / Balls) * 6
 */
export const calculateRunRate = (runs, balls) => {
  if (!balls || balls === 0) return '0.00';
  const rr = (runs / balls) * 6;
  return rr.toFixed(2);
};

/**
 * Format date in clean, readable string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get status color classes
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'LIVE':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse';
    case 'UPCOMING':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'CANCELLED':
      return 'bg-slate-700/50 text-slate-400 border border-slate-600/30';
    default:
      return 'bg-slate-800 text-slate-300';
  }
};

/**
 * Get sport type icon color/badge
 */
export const getSportBadgeClass = (sport) => {
  switch (sport) {
    case 'CRICKET':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'FOOTBALL':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'BASKETBALL':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    default:
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  }
};
