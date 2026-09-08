import { Direction, TileType } from '../types';

export const GRID_SIZE = 13;
export const TILE_SIZE = 32;
export const CANVAS_SIZE = GRID_SIZE * TILE_SIZE; // 416

export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

export const DIR_NAME: Record<Direction, string> = {
  [Direction.UP]: 'UP',
  [Direction.RIGHT]: 'RIGHT',
  [Direction.DOWN]: 'DOWN',
  [Direction.LEFT]: 'LEFT',
};

// Stage 1 (Classic NES stage 1 layout matching user prompt)
export const STAGE_1_MAP: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 2, 0, 2, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
  [1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0],
];

// Stage 2 (Steel fortresses and diagonal corridors)
export const STAGE_2_MAP: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 0, 1, 1, 0, 0, 0, 1, 1, 0, 2, 0],
  [0, 2, 0, 1, 0, 0, 2, 0, 0, 1, 0, 2, 0],
  [0, 0, 0, 1, 0, 1, 2, 1, 0, 1, 0, 0, 0],
  [1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1],
  [0, 1, 1, 0, 2, 2, 0, 2, 2, 0, 1, 1, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 0, 2, 1, 0, 1, 2, 0, 1, 1, 0],
  [1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1],
  [0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0],
  [0, 2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 2, 0],
  [0, 2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 0],
  [0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0],
];

// Stage 3 (Labyrinth defense)
export const STAGE_3_MAP: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 2, 0, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1],
  [1, 0, 2, 0, 1, 1, 1, 1, 1, 0, 2, 0, 1],
  [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
  [0, 0, 1, 1, 0, 2, 0, 2, 0, 1, 1, 0, 0],
  [2, 0, 0, 1, 0, 2, 0, 2, 0, 1, 0, 0, 2],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [1, 0, 2, 0, 0, 1, 1, 1, 0, 0, 2, 0, 1],
  [1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1],
  [1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1],
  [1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0],
];

export const STAGES = [STAGE_1_MAP, STAGE_2_MAP, STAGE_3_MAP];

export const SPAWN_POINTS = [
  { x: 0 * TILE_SIZE + 2, y: 0 * TILE_SIZE + 2 },
  { x: 6 * TILE_SIZE + 2, y: 0 * TILE_SIZE + 2 },
  { x: 12 * TILE_SIZE + 2, y: 0 * TILE_SIZE + 2 },
];

export const PLAYER_SPAWN = {
  x: 4 * TILE_SIZE + 2,
  y: 12 * TILE_SIZE + 2,
};

export const BASE_POS = {
  col: 6,
  row: 12,
};
