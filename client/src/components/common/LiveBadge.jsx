import React from 'react';

const LiveBadge = ({ text = 'LIVE', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
      <span>{text}</span>
    </span>
  );
};

export default LiveBadge;
