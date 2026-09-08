import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { GameState, GameStats } from './types';
import { CANVAS_SIZE, STAGES } from './game/constants';
import { ArcadeSidebar } from './components/ArcadeSidebar';
import { VirtualControls } from './components/VirtualControls';
import { GameOverlay } from './components/GameOverlay';
import { Tv, RotateCcw, Shield, Swords, Info } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    lives: 3,
    enemiesRemaining: 20,
    stage: 1,
    totalKilled: 0,
  });

  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [crtEffect, setCrtEffect] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Initialize engine and loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp pixel rendering
    ctx.imageSmoothingEnabled = false;

    const renderer = new GameRenderer(ctx);
    rendererRef.current = renderer;

    const engine = new GameEngine((newStats, newState) => {
      setStats(newStats);
      setGameState(newState);
    });
    engineRef.current = engine;

    // Initial stats
    setStats({
      score: engine.score,
      highScore: engine.highScore,
      lives: engine.lives,
      enemiesRemaining: engine.totalEnemiesRemaining,
      stage: engine.stageIndex + 1,
      totalKilled: engine.totalKilled,
    });
    setGameState(engine.state);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling on game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      engine.handleKeyDown(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      engine.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    let lastTime = performance.now();
    const targetFpsInterval = 1000 / 60; // 60 FPS

    const loop = (currentTime: number) => {
      const elapsed = currentTime - lastTime;

      if (elapsed > targetFpsInterval - 2) {
        lastTime = currentTime - (elapsed % targetFpsInterval);

        // Update physics and logic
        engine.update();

        // Render current frame
        renderer.clear();
        renderer.drawMap(engine.map);

        if (engine.player.active) {
          renderer.drawTank(engine.player);
        }
        engine.enemies.forEach(e => renderer.drawTank(e));
        engine.bullets.forEach(b => renderer.drawBullet(b));
        renderer.drawExplosions(engine.explosions);
        renderer.drawParticles(engine.particles);
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  const handleFire = useCallback(() => {
    if (engineRef.current && engineRef.current.player.active && engineRef.current.state === GameState.PLAYING) {
      engineRef.current.playerShoot();
    }
  }, []);

  const handlePauseToggle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.restart(true);
    }
  }, []);

  const handleNextStage = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.nextStage();
    }
  }, []);

  const handleSelectStage = (idx: number) => {
    if (engineRef.current) {
      engineRef.current.stageIndex = idx;
      engineRef.current.restart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-between p-3 md:p-6 select-none font-sans">
      {/* Top Header Bar */}
      <header className="w-full max-w-2xl flex items-center justify-between pb-2 mb-2 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#e52521] flex items-center justify-center font-pixel text-[10px] text-white shadow">
            FC
          </div>
          <h1
            id="main-title"
            className="font-pixel text-lg md:text-xl text-[#e52521] tracking-wider drop-shadow-[2px_2px_0px_#fccc00]"
          >
            BATTLE CITY 1985
          </h1>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Stage selection pill */}
          <div className="flex items-center bg-[#222222] border border-[#383838] rounded-md p-0.5 text-[10px] font-pixel">
            {STAGES.map((_, i) => (
              <button
                key={i}
                id={`btn-stage-${i + 1}`}
                onClick={() => handleSelectStage(i)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  stats.stage === i + 1
                    ? 'bg-[#e52521] text-white font-bold'
                    : 'text-[#888888] hover:text-white'
                }`}
                title={`關卡 ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* CRT scanline toggle */}
          <button
            id="btn-crt-toggle"
            type="button"
            onClick={() => setCrtEffect(!crtEffect)}
            className={`p-2 rounded-md border text-xs transition-colors cursor-pointer ${
              crtEffect
                ? 'bg-[#065f46] border-[#047857] text-[#6ee7b7]'
                : 'bg-[#222222] border-[#383838] text-[#888888] hover:text-white'
            }`}
            title="復古 CRT 掃描線濾鏡"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Help button */}
          <button
            id="btn-help-toggle"
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-md bg-[#222222] border border-[#383838] text-[#888888] hover:text-white transition-colors cursor-pointer"
            title="說明"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Arcade Frame */}
      <main className="flex flex-col items-center justify-center w-full my-auto">
        <div
          id="arcade-console"
          className="relative bg-[#6b7280] p-3 md:p-4 rounded-xl border-4 border-[#374151] shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-full"
        >
          {/* Famicom Decorative Header Badge */}
          <div className="flex items-center justify-between text-[9px] font-pixel text-[#1f2937] px-1 pb-2">
            <span className="flex items-center gap-1 font-bold">
              <Swords className="w-3 h-3 text-[#b91c1c]" /> 8-BIT TANK BATTLEFIELD
            </span>
            <span className="flex items-center gap-1 font-bold">
              <Shield className="w-3 h-3 text-[#15803d]" /> DEFEND THE EAGLE
            </span>
          </div>

          {/* Game Viewport Container */}
          <div
            id="viewport-container"
            className="relative flex bg-[#000000] border-4 border-[#1f2937] rounded overflow-hidden shadow-inner"
          >
            {/* 416x416 Canvas */}
            <canvas
              ref={canvasRef}
              id="gameCanvas"
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="pixelated block bg-black max-w-[calc(100vw-120px)] max-h-[60vh] md:max-h-none md:w-[416px] md:h-[416px] object-contain"
            />

            {/* Retro Sidebar */}
            <ArcadeSidebar stats={stats} />

            {/* CRT TV scanlines overlay */}
            {crtEffect && (
              <div
                className="pointer-events-none absolute inset-0 z-10 opacity-30"
                style={{
                  background:
                    'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))',
                  backgroundSize: '100% 3px, 6px 100%',
                }}
              />
            )}

            {/* In-Game State Overlay (Game Over / Victory / Pause) */}
            <GameOverlay
              state={gameState}
              stats={stats}
              onRestart={handleRestart}
              onNextStage={handleNextStage}
              onResume={handlePauseToggle}
            />
          </div>
        </div>

        {/* Virtual Gamepad for Mobile & Touch */}
        <div className="w-full max-w-md">
          <VirtualControls
            engine={engineRef.current}
            onFire={handleFire}
            onPauseToggle={handlePauseToggle}
            onRestart={handleRestart}
          />
        </div>
      </main>

      {/* Instructions & Footer Bar */}
      <footer className="w-full max-w-2xl mt-4 pt-2 border-t border-[#262626] text-center">
        <div className="text-xs md:text-sm text-[#9ca3af] flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
          <span>操作：</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">W</kbd>
            <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">A</kbd>
            <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">S</kbd>
            <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">D</kbd>
            <span className="text-[#6b7280]">或</span>
            <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">↑</kbd>
            <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">←</kbd>
            <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">↓</kbd>
            <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">→</kbd>
          </span>
          <span className="text-[#4b5563]">｜</span>
          <span>發射：</span>
          <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-2 py-0.5 rounded border border-[#444] text-[11px] font-mono">Space 空白鍵</kbd>
          <span className="text-[#4b5563]">｜</span>
          <span>重啟：</span>
          <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-2 py-0.5 rounded border border-[#444] text-[11px] font-mono">Enter</kbd>
          <span className="text-[#4b5563]">｜</span>
          <span>暫停：</span>
          <kbd className="bg-[#2a2a2a] text-[#f3f4f6] px-1.5 py-0.5 rounded border border-[#444] text-[11px] font-mono">P</kbd>
        </div>

        {/* Detailed Rules Drawer / Modal if opened */}
        {showHelp && (
          <div className="mt-3 p-3 bg-[#1e1e1e] border border-[#333] rounded-lg text-left text-xs text-[#a3a3a3] space-y-1.5">
            <div className="font-pixel text-[#facc15] text-[11px] mb-1">【戰術情報與圖塊說明】</div>
            <p>• <span className="text-[#ea580c] font-bold">紅磚牆（Brick）</span>：可被任何子彈摧毀開闢路徑。</p>
            <p>• <span className="text-[#e2e8f0] font-bold">鋼鐵牆（Steel）</span>：常規砲彈無法擊穿，彈道會被吸收。</p>
            <p>• <span className="text-[#facc15] font-bold">老鷹基地（Base）</span>：守衛目標！若基地被敵方或我方子彈擊毀，遊戲直接失敗。</p>
            <p>• <span className="text-[#38bdf8] font-bold">敵方裝甲坦克</span>：綠色或多色重裝甲坦克需要連續命中 3 發才能消滅。</p>
            <p>• <span className="text-[#4ade80] font-bold">重生護盾</span>：剛出生或復活時享有 2 秒無敵光環護盾。</p>
          </div>
        )}
      </footer>
    </div>
  );
}
