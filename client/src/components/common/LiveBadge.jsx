import React from 'react';

const LiveBadge = ({ text = 'LIVE', className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}>
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
      <span className="w-1.5 h-1.5 -ml-2.5 rounded-full bg-rose-500"></span>
      {text}
    </span>
  );
};

export default LiveBadge;
