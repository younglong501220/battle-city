import {
  Direction,
  TileType,
  GameState,
  EnemyType,
  Bullet,
  Tank,
  Particle,
  Explosion,
  GameStats,
} from '../types';
import {
  GRID_SIZE,
  TILE_SIZE,
  CANVAS_SIZE,
  DX,
  DY,
  STAGES,
  SPAWN_POINTS,
  PLAYER_SPAWN,
  BASE_POS,
} from './constants';
import { sound } from '../audio/soundManager';

export class GameEngine {
  public map: number[][];
  public player: Tank;
  public enemies: Tank[];
  public bullets: Bullet[];
  public particles: Particle[];
  public explosions: Explosion[];

  public state: GameState;
  public stageIndex: number;
  public totalEnemiesRemaining: number;
  public enemiesToSpawn: number;
  public spawnTimer: number;

  public score: number;
  public highScore: number;
  public lives: number;
  public totalKilled: number;

  public baseAlive: boolean;
  public keys: Record<string, boolean>;

  private onStatsUpdate?: (stats: GameStats, state: GameState) => void;
  private spawnIndex: number = 0;

  constructor(onStatsUpdate?: (stats: GameStats, state: GameState) => void) {
    this.onStatsUpdate = onStatsUpdate;
    this.stageIndex = 0;
    this.map = this.loadStageMap(0);
    this.state = GameState.PLAYING;

    this.score = 0;
    this.highScore = this.getStoredHighScore();
    this.lives = 3;
    this.totalKilled = 0;
    this.baseAlive = true;

    this.totalEnemiesRemaining = 20;
    this.enemiesToSpawn = 20;
    this.spawnTimer = 0;

    this.player = this.createPlayer();
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.explosions = [];
    this.keys = {};

    sound.playStartJingle();
  }

  private getStoredHighScore(): number {
    try {
      const saved = localStorage.getItem('battle_city_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('battle_city_highscore', this.highScore.toString());
      } catch {
        // Storage safety
      }
    }
  }

  private loadStageMap(stageIdx: number): number[][] {
    const raw = STAGES[stageIdx % STAGES.length];
    return JSON.parse(JSON.stringify(raw));
  }

  private createPlayer(): Tank {
    return {
      id: 'player',
      x: PLAYER_SPAWN.x,
      y: PLAYER_SPAWN.y,
      size: 28,
      dir: Direction.UP,
      speed: 2.3,
      color: '#facc15', // Classic gold
      isPlayer: true,
      cooldown: 0,
      maxCooldown: 15,
      active: true,
      moveTimer: 0,
      armor: 1,
      shieldTimer: 120, // 2 seconds invulnerability upon spawn
      trackFrame: 0,
    };
  }

  public restart(fullReset: boolean = false) {
    if (fullReset) {
      this.stageIndex = 0;
      this.score = 0;
      this.lives = 3;
      this.totalKilled = 0;
    }
    this.map = this.loadStageMap(this.stageIndex);
    this.player = this.createPlayer();
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.explosions = [];
    this.totalEnemiesRemaining = 20;
    this.enemiesToSpawn = 20;
    this.spawnTimer = 0;
    this.baseAlive = true;
    this.state = GameState.PLAYING;

    sound.init();
    sound.playStartJingle();
    this.notifyStats();
  }

  public nextStage() {
    this.stageIndex++;
    this.restart(false);
  }

  public togglePause(): boolean {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.notifyStats();
      return true;
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.notifyStats();
      return false;
    }
    return false;
  }

  public handleKeyDown(code: string) {
    sound.init();
    this.keys[code] = true;

    if (code === 'Space' || code === 'KeyJ' || code === 'KeyZ') {
      if (this.state === GameState.PLAYING && this.player.active) {
        this.playerShoot();
      }
    }

    if (code === 'Enter') {
      if (this.state === GameState.GAMEOVER) {
        this.restart(true);
      } else if (this.state === GameState.VICTORY) {
        this.nextStage();
      }
    }

    if (code === 'KeyP' || code === 'Escape') {
      this.togglePause();
    }
  }

  public handleKeyUp(code: string) {
    this.keys[code] = false;
  }

  public playerShoot() {
    if (this.player.cooldown > 0) return;
    this.player.cooldown = this.player.maxCooldown;

    const bx = this.player.x + this.player.size / 2 + DX[this.player.dir] * 16;
    const by = this.player.y + this.player.size / 2 + DY[this.player.dir] * 16;

    this.bullets.push({
      x: bx - 3,
      y: by - 3,
      w: 6,
      h: 6,
      dir: this.player.dir,
      speed: 5.5,
      isPlayer: true,
      active: true,
    });

    sound.playShoot();
  }

  public spawnEnemy() {
    if (this.enemiesToSpawn <= 0 || this.enemies.length >= 4) return;

    const sp = SPAWN_POINTS[this.spawnIndex % SPAWN_POINTS.length];
    this.spawnIndex++;

    // Check if spawn position is occupied by existing tank
    const occupied = this.enemies.some(
      e => Math.hypot(e.x - sp.x, e.y - sp.y) < 28
    ) || Math.hypot(this.player.x - sp.x, this.player.y - sp.y) < 28;

    if (occupied) return;

    // Pick enemy type randomly with weights
    const rand = Math.random();
    let type = EnemyType.BASIC;
    let speed = 0.45; // Noticeably slower retro speed (was 0.7)
    let color = '#d4d4d8'; // Light gray
    let armor = 1;
    let maxCd = 65;

    if (rand < 0.25) {
      type = EnemyType.FAST;
      speed = 0.70; // Noticeably slower fast tank (was 1.1)
      color = '#fef08a'; // Pale yellow
      maxCd = 55;
    } else if (rand < 0.5) {
      type = EnemyType.POWER;
      speed = 0.50; // Noticeably slower power tank (was 0.85)
      color = '#ef4444'; // Red
      maxCd = 45;
    } else if (rand < 0.75) {
      type = EnemyType.ARMOR;
      speed = 0.35; // Slow heavy armor tank (was 0.55)
      color = '#16a34a'; // Heavy green
      armor = 3;
      maxCd = 75;
    }

    const enemy: Tank = {
      id: `enemy_${Date.now()}_${Math.random()}`,
      x: sp.x,
      y: sp.y,
      size: 28,
      dir: Direction.DOWN,
      speed,
      color,
      isPlayer: false,
      enemyType: type,
      cooldown: 20,
      maxCooldown: maxCd,
      active: true,
      moveTimer: 30,
      armor,
      trackFrame: 0,
    };

    this.enemies.push(enemy);
    this.enemiesToSpawn--;
    this.notifyStats();
  }

  private enemyShoot(enemy: Tank) {
    if (enemy.cooldown > 0) return;
    enemy.cooldown = enemy.maxCooldown;

    const bx = enemy.x + enemy.size / 2 + DX[enemy.dir] * 16;
    const by = enemy.y + enemy.size / 2 + DY[enemy.dir] * 16;

    this.bullets.push({
      x: bx - 3,
      y: by - 3,
      w: 6,
      h: 6,
      dir: enemy.dir,
      speed: enemy.enemyType === EnemyType.POWER ? 3.4 : 2.6,
      isPlayer: false,
      active: true,
    });
  }

  private checkTileCollision(nx: number, ny: number, size: number): boolean {
    const l = Math.floor(nx / TILE_SIZE);
    const r = Math.floor((nx + size - 1) / TILE_SIZE);
    const t = Math.floor(ny / TILE_SIZE);
    const b = Math.floor((ny + size - 1) / TILE_SIZE);

    for (let row = t; row <= b; row++) {
      for (let col = l; col <= r; col++) {
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          const tile = this.map[row][col];
          if (
            tile === TileType.BRICK ||
            tile === TileType.STEEL ||
            tile === TileType.BASE ||
            tile === TileType.BASE_DEAD
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private checkTankTankCollision(tank: Tank, nx: number, ny: number): boolean {
    // Check against player if this is enemy
    if (!tank.isPlayer && this.player.active) {
      if (
        nx < this.player.x + this.player.size &&
        nx + tank.size > this.player.x &&
        ny < this.player.y + this.player.size &&
        ny + tank.size > this.player.y
      ) {
        return true;
      }
    }

    // Check against all active enemies
    for (const other of this.enemies) {
      if (other === tank || !other.active) continue;
      if (
        nx < other.x + other.size &&
        nx + tank.size > other.x &&
        ny < other.y + other.size &&
        ny + tank.size > other.y
      ) {
        return true;
      }
    }

    return false;
  }

  public tryMoveTank(tank: Tank, dir: Direction): boolean {
    tank.dir = dir;
    let nx = tank.x + DX[dir] * tank.speed;
    let ny = tank.y + DY[dir] * tank.speed;

    // Grid snapping assistance for turning into 16px corridors
    if (tank.isPlayer) {
      const LANE_UNIT = 16;
      if (dir === Direction.UP || dir === Direction.DOWN) {
        // Moving vertically, snap X to nearest lane if close
        const remainder = nx % LANE_UNIT;
        if (remainder > 0 && remainder < 6) {
          nx -= remainder;
        } else if (remainder >= LANE_UNIT - 6) {
          nx += LANE_UNIT - remainder;
        }
      } else {
        // Moving horizontally, snap Y to nearest lane if close
        const remainder = ny % LANE_UNIT;
        if (remainder > 0 && remainder < 6) {
          ny -= remainder;
        } else if (remainder >= LANE_UNIT - 6) {
          ny += LANE_UNIT - remainder;
        }
      }
    }

    // Canvas boundary constraints
    if (nx < 2) nx = 2;
    if (nx + tank.size > CANVAS_SIZE - 2) nx = CANVAS_SIZE - tank.size - 2;
    if (ny < 2) ny = 2;
    if (ny + tank.size > CANVAS_SIZE - 2) ny = CANVAS_SIZE - tank.size - 2;

    // Check tile collision
    if (this.checkTileCollision(nx, ny, tank.size)) {
      return false;
    }

    // Check tank-tank collision
    if (this.checkTankTankCollision(tank, nx, ny)) {
      return false;
    }

    tank.x = nx;
    tank.y = ny;
    // Animate tracks
    tank.trackFrame = tank.trackFrame === 0 ? 1 : 0;
    return true;
  }

  public createExplosion(x: number, y: number, isBig: boolean = false) {
    sound.playExplosion(isBig);
    this.explosions.push({
      x,
      y,
      radius: isBig ? 8 : 4,
      maxRadius: isBig ? 24 : 12,
      timer: 15,
      isBig,
    });

    const count = isBig ? 22 : 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * (isBig ? 4.5 : 2.5) + 0.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: Math.random() * 3 + 2,
        life: 18 + Math.floor(Math.random() * 12),
        maxLife: 30,
        color: ['#ff0000', '#f97316', '#facc15', '#ffffff'][
          Math.floor(Math.random() * 4)
        ],
      });
    }
  }

  public update() {
    if (this.state !== GameState.PLAYING) return;

    // Player shield countdown
    if (this.player.shieldTimer && this.player.shieldTimer > 0) {
      this.player.shieldTimer--;
    }

    // Player Cooldown
    if (this.player.cooldown > 0) {
      this.player.cooldown--;
    }

    // Player Input
    if (this.player.active) {
      if (this.keys['ArrowUp'] || this.keys['KeyW']) {
        this.tryMoveTank(this.player, Direction.UP);
      } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
        this.tryMoveTank(this.player, Direction.DOWN);
      } else if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
        this.tryMoveTank(this.player, Direction.LEFT);
      } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
        this.tryMoveTank(this.player, Direction.RIGHT);
      }
    }

    // Enemy Spawn
    this.spawnTimer++;
    if (this.spawnTimer > 100) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // Enemy AI
    this.enemies.forEach(enemy => {
      if (enemy.cooldown > 0) enemy.cooldown--;
      enemy.moveTimer--;

      if (enemy.moveTimer <= 0) {
        // Strategic direction choice
        const rand = Math.random();
        if (rand < 0.45) {
          // Bias towards eagle base (DOWN)
          enemy.dir = Direction.DOWN;
        } else if (rand < 0.65) {
          // Towards player horizontal
          enemy.dir =
            this.player.x < enemy.x ? Direction.LEFT : Direction.RIGHT;
        } else {
          // Random
          enemy.dir = Math.floor(Math.random() * 4) as Direction;
        }
        enemy.moveTimer = 40 + Math.floor(Math.random() * 60);
      }

      const moved = this.tryMoveTank(enemy, enemy.dir);
      if (!moved) {
        // If blocked, immediately pick another direction
        const alternatives = [
          Direction.UP,
          Direction.RIGHT,
          Direction.DOWN,
          Direction.LEFT,
        ].filter(d => d !== enemy.dir);
        enemy.dir =
          alternatives[Math.floor(Math.random() * alternatives.length)];
        enemy.moveTimer = 30 + Math.floor(Math.random() * 40);
      }

      // Random shooting
      const shootChance = enemy.enemyType === EnemyType.POWER ? 0.025 : 0.015;
      if (Math.random() < shootChance) {
        this.enemyShoot(enemy);
      }
    });

    // Bullets update
    this.bullets.forEach(b => {
      b.x += DX[b.dir] * b.speed;
      b.y += DY[b.dir] * b.speed;

      // Boundary check
      if (b.x < 0 || b.x > CANVAS_SIZE || b.y < 0 || b.y > CANVAS_SIZE) {
        b.active = false;
        return;
      }

      // Bullet vs Map Tile check
      const col = Math.floor((b.x + b.w / 2) / TILE_SIZE);
      const row = Math.floor((b.y + b.h / 2) / TILE_SIZE);

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        const tile = this.map[row][col];
        if (tile === TileType.BRICK) {
          this.map[row][col] = TileType.EMPTY;
          b.active = false;
          sound.playBrickHit();
          this.createExplosion(b.x + 3, b.y + 3, false);
        } else if (tile === TileType.STEEL) {
          b.active = false;
          sound.playSteelHit();
          this.createExplosion(b.x + 3, b.y + 3, false);
        } else if (tile === TileType.BASE) {
          this.map[row][col] = TileType.BASE_DEAD;
          this.baseAlive = false;
          b.active = false;
          sound.playBaseDestroyed();
          this.createExplosion(
            BASE_POS.col * TILE_SIZE + 16,
            BASE_POS.row * TILE_SIZE + 16,
            true
          );
          this.state = GameState.GAMEOVER;
          this.saveHighScore();
          sound.playGameOverJingle();
          this.notifyStats();
        }
      }
    });

    // Bullet vs Bullet collision (cancel each other out)
    for (let i = 0; i < this.bullets.length; i++) {
      const b1 = this.bullets[i];
      if (!b1.active) continue;

      for (let j = i + 1; j < this.bullets.length; j++) {
        const b2 = this.bullets[j];
        if (!b2.active) continue;

        if (b1.isPlayer !== b2.isPlayer) {
          const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
          if (dist < 10) {
            b1.active = false;
            b2.active = false;
            this.createExplosion(
              (b1.x + b2.x) / 2,
              (b1.y + b2.y) / 2,
              false
            );
            break;
          }
        }
      }
    }

    // Bullet vs Tanks
    this.bullets.forEach(b => {
      if (!b.active) return;

      // Player bullet hits enemy tank
      if (b.isPlayer) {
        this.enemies.forEach(enemy => {
          if (!enemy.active || !b.active) return;
          if (
            b.x + b.w > enemy.x &&
            b.x < enemy.x + enemy.size &&
            b.y + b.h > enemy.y &&
            b.y < enemy.y + enemy.size
          ) {
            b.active = false;

            if (enemy.armor > 1) {
              enemy.armor--;
              sound.playSteelHit();
              this.createExplosion(b.x, b.y, false);
            } else {
              enemy.active = false;
              this.totalEnemiesRemaining--;
              this.totalKilled++;

              let points = 100;
              if (enemy.enemyType === EnemyType.FAST) points = 200;
              else if (enemy.enemyType === EnemyType.POWER) points = 300;
              else if (enemy.enemyType === EnemyType.ARMOR) points = 400;

              this.score += points;
              this.saveHighScore();
              this.createExplosion(
                enemy.x + enemy.size / 2,
                enemy.y + enemy.size / 2,
                true
              );
              this.notifyStats();
            }
          }
        });
      }

      // Enemy bullet hits player
      if (!b.isPlayer && this.player.active) {
        if (
          b.x + b.w > this.player.x &&
          b.x < this.player.x + this.player.size &&
          b.y + b.h > this.player.y &&
          b.y < this.player.y + this.player.size
        ) {
          b.active = false;

          // If protected by shield, ignore damage
          if (this.player.shieldTimer && this.player.shieldTimer > 0) {
            sound.playSteelHit();
            this.createExplosion(b.x, b.y, false);
            return;
          }

          this.createExplosion(
            this.player.x + this.player.size / 2,
            this.player.y + this.player.size / 2,
            true
          );

          this.lives--;
          this.notifyStats();

          if (this.lives <= 0) {
            this.player.active = false;
            this.state = GameState.GAMEOVER;
            this.saveHighScore();
            sound.playGameOverJingle();
            this.notifyStats();
          } else {
            // Respawn player
            this.player.x = PLAYER_SPAWN.x;
            this.player.y = PLAYER_SPAWN.y;
            this.player.dir = Direction.UP;
            this.player.shieldTimer = 120; // 2s shield
          }
        }
      }
    });

    // Cleanup inactive
    this.bullets = this.bullets.filter(b => b.active);
    this.enemies = this.enemies.filter(e => e.active);

    // Update explosions
    this.explosions.forEach(exp => exp.timer--);
    this.explosions = this.explosions.filter(exp => exp.timer > 0);

    // Update particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    // Victory condition check
    if (this.totalEnemiesRemaining <= 0 && this.enemies.length === 0) {
      this.state = GameState.VICTORY;
      this.saveHighScore();
      sound.playVictoryJingle();
      this.notifyStats();
    }
  }

  public notifyStats() {
    if (this.onStatsUpdate) {
      this.onStatsUpdate(
        {
          score: this.score,
          highScore: this.highScore,
          lives: this.lives,
          enemiesRemaining: this.totalEnemiesRemaining,
          stage: this.stageIndex + 1,
          totalKilled: this.totalKilled,
        },
        this.state
      );
    }
  }
}
