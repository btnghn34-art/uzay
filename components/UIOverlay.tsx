import React from 'react';
import { GameStats } from '../types';

interface UIOverlayProps {
  stats: GameStats;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ stats }) => {
  return (
    <div className="absolute top-4 left-0 w-full px-4 pointer-events-none select-none">
      <div className="max-w-md mx-auto flex justify-between items-center bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-full py-3 px-6 text-white shadow-xl">
        
        {/* Score */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Puan</span>
          <span className="text-xl font-bold text-yellow-400">{stats.score}</span>
        </div>

        {/* Time */}
        <div className="flex flex-col items-center mx-4">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Süre</span>
          <span className={`text-2xl font-mono font-bold ${stats.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {stats.timeLeft}s
          </span>
        </div>

        {/* Lives */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Can</span>
          <div className="flex gap-1 text-lg">
             {[...Array(3)].map((_, i) => (
                <span key={i} className={i < stats.lives ? 'opacity-100' : 'opacity-20 grayscale'}>
                  ❤️
                </span>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;