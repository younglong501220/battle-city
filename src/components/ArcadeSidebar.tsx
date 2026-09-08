import React from 'react';
import { GameStats } from '../types';

interface ArcadeSidebarProps {
  stats: GameStats;
}

export const ArcadeSidebar: React.FC<ArcadeSidebarProps> = ({ stats }) => {
  // Render grid of mini enemy tanks (up to 20)
  const enemyIcons = Array.from({ length: 20 }, (_, i) => i < stats.enemiesRemaining);

  return (
    <div
      id="arcade-sidebar"
      className="w-24 md:w-28 bg-[#7f7f7f] border-l-4 border-[#333333] p-2.5 flex flex-col justify-between select-none shadow-inner"
    >
      {/* Top section: Enemies remaining icons */}
      <div>
        <div className="text-[10px] font-pixel text-[#222222] uppercase tracking-wider mb-2 text-center font-bold">
          ENEMY
        </div>
        <div className="grid grid-cols-2 gap-1.5 justify-items-center mb-4">
          {enemyIcons.map((alive, index) => (
            <div
              key={index}
              className={`w-3.5 h-3.5 flex items-center justify-center transition-opacity duration-150 ${
                alive ? 'opacity-100' : 'opacity-15'
              }`}
              title={`Enemy ${index + 1}`}
            >
              {/* Mini 8-bit tank SVG silhouette */}
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-[#111111]">
                <rect x="1" y="1" width="3" height="14" />
                <rect x="12" y="1" width="3" height="14" />
                <rect x="4" y="3" width="8" height="10" />
                <rect x="7" y="0" width="2" height="6" />
                <rect x="6" y="6" width="4" height="4" fill="#666666" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Middle section: Player 1 Lives */}
      <div className="border-t-2 border-[#555555] pt-3 pb-3 flex flex-col items-center">
        <div className="flex items-center gap-1 mb-1">
          <span className="font-pixel text-[11px] text-[#222222] font-bold">IP</span>
          {/* Mini player tank */}
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-[#eab308]">
            <rect x="1" y="1" width="3" height="14" />
            <rect x="12" y="1" width="3" height="14" />
            <rect x="4" y="3" width="8" height="10" />
            <rect x="7" y="0" width="2" height="6" />
          </svg>
        </div>
        <div className="font-pixel text-lg text-[#164e63] font-bold tracking-tight">
          {stats.lives}
        </div>
      </div>

      {/* Stage flag */}
      <div className="border-t-2 border-[#555555] pt-2 pb-2 flex flex-col items-center">
        <div className="w-6 h-5 relative mb-1">
          {/* Classic flag icon */}
          <div className="w-1 h-5 bg-[#222] absolute left-0"></div>
          <div className="w-4 h-3 bg-[#dc2626] absolute left-1 top-0 border border-[#991b1b]"></div>
        </div>
        <div className="font-pixel text-xs text-[#111111] font-bold">
          {stats.stage}
        </div>
      </div>

      {/* Score */}
      <div className="border-t-2 border-[#555555] pt-2 text-center">
        <div className="text-[9px] font-pixel text-[#333333] mb-0.5">SCORE</div>
        <div className="font-pixel text-[11px] text-white bg-[#222222] px-1 py-1 rounded shadow-inner">
          {stats.score}
        </div>
      </div>
    </div>
  );
};
