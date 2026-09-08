import React, { useRef, useEffect } from 'react';
import { Direction } from '../types';
import { GameEngine } from '../game/engine';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw } from 'lucide-react';

interface VirtualControlsProps {
  engine: GameEngine | null;
  onFire: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  engine,
  onFire,
  onPauseToggle,
  onRestart,
}) => {
  const activeDirRef = useRef<Direction | null>(null);
  const moveIntervalRef = useRef<number | null>(null);

  const startMoving = (dir: Direction) => {
    activeDirRef.current = dir;
    if (engine && engine.player.active) {
      engine.tryMoveTank(engine.player, dir);
    }

    if (!moveIntervalRef.current) {
      moveIntervalRef.current = window.setInterval(() => {
        if (activeDirRef.current !== null && engine && engine.player.active) {
          engine.tryMoveTank(engine.player, activeDirRef.current);
        }
      }, 30);
    }
  };

  const stopMoving = () => {
    activeDirRef.current = null;
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, []);

  return (
    <div
      id="virtual-controls"
      className="w-full max-w-md mx-auto mt-4 px-3 py-3 bg-[#242424] border-2 border-[#444444] rounded-xl flex items-center justify-between shadow-2xl select-none"
    >
      {/* D-Pad */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* D-pad cross background */}
        <div className="absolute w-12 h-32 bg-[#1a1a1a] rounded-md border border-[#333]"></div>
        <div className="absolute w-32 h-12 bg-[#1a1a1a] rounded-md border border-[#333]"></div>

        {/* UP */}
        <button
          id="btn-dpad-up"
          type="button"
          onPointerDown={e => {
            e.preventDefault();
            startMoving(Direction.UP);
          }}
          onPointerUp={stopMoving}
          onPointerLeave={stopMoving}
          className="absolute top-1 left-12 w-12 h-11 bg-[#333333] active:bg-[#eab308] active:text-black rounded-t-md flex items-center justify-center shadow transition-colors text-white touch-manipulation"
          aria-label="Move Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* DOWN */}
        <button
          id="btn-dpad-down"
          type="button"
          onPointerDown={e => {
            e.preventDefault();
            startMoving(Direction.DOWN);
          }}
          onPointerUp={stopMoving}
          onPointerLeave={stopMoving}
          className="absolute bottom-1 left-12 w-12 h-11 bg-[#333333] active:bg-[#eab308] active:text-black rounded-b-md flex items-center justify-center shadow transition-colors text-white touch-manipulation"
          aria-label="Move Down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* LEFT */}
        <button
          id="btn-dpad-left"
          type="button"
          onPointerDown={e => {
            e.preventDefault();
            startMoving(Direction.LEFT);
          }}
          onPointerUp={stopMoving}
          onPointerLeave={stopMoving}
          className="absolute left-1 top-12 w-11 h-12 bg-[#333333] active:bg-[#eab308] active:text-black rounded-l-md flex items-center justify-center shadow transition-colors text-white touch-manipulation"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* RIGHT */}
        <button
          id="btn-dpad-right"
          type="button"
          onPointerDown={e => {
            e.preventDefault();
            startMoving(Direction.RIGHT);
          }}
          onPointerUp={stopMoving}
          onPointerLeave={stopMoving}
          className="absolute right-1 top-12 w-11 h-12 bg-[#333333] active:bg-[#eab308] active:text-black rounded-r-md flex items-center justify-center shadow transition-colors text-white touch-manipulation"
          aria-label="Move Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Center pivot dot */}
        <div className="absolute w-6 h-6 bg-[#2a2a2a] rounded-full z-10 pointer-events-none"></div>
      </div>

      {/* Middle buttons: Pause & Restart */}
      <div className="flex flex-col gap-2.5 items-center">
        <button
          id="btn-pause"
          type="button"
          onClick={onPauseToggle}
          className="p-3 rounded-lg bg-[#262626] hover:bg-[#333333] border border-[#444] text-[#a3a3a3] hover:text-white active:scale-95 transition-all text-xs font-pixel cursor-pointer"
          title="暫停遊戲 (P)"
        >
          <Play className="w-5 h-5" />
        </button>

        <button
          id="btn-restart"
          type="button"
          onClick={onRestart}
          className="p-3 rounded-lg bg-[#262626] hover:bg-[#333333] border border-[#444] text-[#a3a3a3] hover:text-[#fbbf24] active:scale-95 transition-all text-xs font-pixel cursor-pointer"
          title="重新開始 (Enter)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons: FIRE (Space) */}
      <div className="flex flex-col items-center gap-2">
        <button
          id="btn-action-fire"
          type="button"
          onPointerDown={e => {
            e.preventDefault();
            onFire();
          }}
          className="w-18 h-18 rounded-full bg-gradient-to-br from-[#ef4444] to-[#b91c1c] active:from-[#dc2626] active:to-[#991b1b] active:scale-95 border-4 border-[#7f1d1d] shadow-lg flex flex-col items-center justify-center text-white font-pixel text-xs tracking-wider transition-transform touch-manipulation cursor-pointer"
        >
          <span>FIRE</span>
          <span className="text-[8px] opacity-75 font-sans mt-0.5">SPACE</span>
        </button>
      </div>
    </div>
  );
};
