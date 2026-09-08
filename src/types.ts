export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  BASE = 3,
  BASE_DEAD = 4,
  WATER = 5,
  TREES = 6,
}

export enum GameState {
  TITLE = 'TITLE',
  STAGE_START = 'STAGE_START',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAMEOVER = 'GAMEOVER',
  VICTORY = 'VICTORY',
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  POWER = 'POWER',
  ARMOR = 'ARMOR',
}

export interface Bullet {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: Direction;
  speed: number;
  isPlayer: boolean;
  active: boolean;
  power?: number;
}

export interface Tank {
  id: string;
  x: number;
  y: number;
  size: number;
  dir: Direction;
  speed: number;
  color: string;
  isPlayer: boolean;
  enemyType?: EnemyType;
  cooldown: number;
  maxCooldown: number;
  active: boolean;
  moveTimer: number;
  armor: number; // For armor tanks
  shieldTimer?: number; // Invulnerability shield
  trackFrame: number; // 0 or 1 for animated tracks
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  timer: number;
  isBig: boolean;
}

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  lives: number;
  enemiesRemaining: number;
  stage: number;
  totalKilled: number;
}
