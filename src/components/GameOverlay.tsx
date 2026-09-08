import React from 'react';
import { GameState, GameStats } from '../types';
import { RotateCcw, Play, Trophy, ShieldAlert, Award } from 'lucide-react';

interface GameOverlayProps {
  state: GameState;
  stats: GameStats;
  onRestart: () => void;
  onNextStage: () => void;
  onResume: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  state,
  stats,
  onRestart,
  onNextStage,
  onResume,
}) => {
  if (state === GameState.PLAYING) return null;

  return (
    <div
      id="game-overlay"
      className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-xs z-20 animate-fade-in"
    >
      {state === GameState.GAMEOVER && (
        <div className="flex flex-col items-center max-w-xs w-full space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-pixel text-2xl text-[#e52521] tracking-wider drop-shadow-[0_4px_8px_rgba(229,37,33,0.5)]">
            GAME OVER
          </h2>

          <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-lg p-3 w-full space-y-2 text-xs font-pixel">
            <div className="flex justify-between text-[#a3a3a3]">
              <span>SCORE</span>
              <span className="text-white">{stats.score}</span>
            </div>
            <div className="flex justify-between text-[#a3a3a3]">
              <span>HIGH SCORE</span>
              <span className="text-[#facc15]">{stats.highScore}</span>
            </div>
            <div className="flex justify-between text-[#a3a3a3]">
              <span>KILLED</span>
              <span className="text-[#38bdf8]">{stats.totalKilled}</span>
            </div>
          </div>

          <button
            id="btn-overlay-restart"
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-4 bg-[#e52521] hover:bg-[#b91c1c] active:scale-95 text-white font-pixel text-xs tracking-wider rounded-md shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新挑戰 (ENTER)</span>
          </button>
        </div>
      )}

      {state === GameState.VICTORY && (
        <div className="flex flex-col items-center max-w-xs w-full space-y-4">
          <div className="text-yellow-400">
            <Award className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="font-pixel text-2xl text-[#fccc00] tracking-wider drop-shadow-[0_4px_8px_rgba(252,204,0,0.5)]">
            STAGE CLEAR!
          </h2>

          <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-lg p-3 w-full space-y-2 text-xs font-pixel">
            <div className="flex justify-between text-[#a3a3a3]">
              <span>STAGE</span>
              <span className="text-[#4ade80]">{stats.stage} COMPLETED</span>
            </div>
            <div className="flex justify-between text-[#a3a3a3]">
              <span>SCORE</span>
              <span className="text-white">{stats.score}</span>
            </div>
            <div className="flex justify-between text-[#a3a3a3]">
              <span>HIGH SCORE</span>
              <span className="text-[#facc15]">{stats.highScore}</span>
            </div>
          </div>

          <button
            id="btn-overlay-next-stage"
            type="button"
            onClick={onNextStage}
            className="w-full py-3 px-4 bg-[#16a34a] hover:bg-[#15803d] active:scale-95 text-white font-pixel text-xs tracking-wider rounded-md shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>進入下一關 (ENTER)</span>
          </button>
        </div>
      )}

      {state === GameState.PAUSED && (
        <div className="flex flex-col items-center max-w-xs w-full space-y-4">
          <h2 className="font-pixel text-2xl text-[#38bdf8] tracking-widest animate-pulse">
            PAUSED
          </h2>
          <p className="text-xs text-[#a3a3a3] font-retro text-lg">
            按下 P 鍵或點擊下方按鈕繼續
          </p>

          <button
            id="btn-overlay-resume"
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 bg-[#0284c7] hover:bg-[#0369a1] active:scale-95 text-white font-pixel text-xs tracking-wider rounded-md shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>繼續戰鬥</span>
          </button>
        </div>
      )}
    </div>
  );
};
