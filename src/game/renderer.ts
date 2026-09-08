import { Direction, TileType, Tank, Bullet, Particle, Explosion, EnemyType } from '../types';
import { TILE_SIZE, CANVAS_SIZE, GRID_SIZE } from './constants';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public clear() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  public drawMap(map: number[][]) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = map[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === TileType.BRICK) {
          this.drawBrickTile(x, y);
        } else if (tile === TileType.STEEL) {
          this.drawSteelTile(x, y);
        } else if (tile === TileType.BASE) {
          this.drawBaseAlive(x, y);
        } else if (tile === TileType.BASE_DEAD) {
          this.drawBaseDead(x, y);
        }
      }
    }
  }

  private drawBrickTile(x: number, y: number) {
    const ctx = this.ctx;
    // 4 mini brick blocks in 32x32
    ctx.fillStyle = '#b84418';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Dark mortar lines
    ctx.fillStyle = '#4a1506';
    // Horizontal mortar
    ctx.fillRect(x, y + 7, TILE_SIZE, 2);
    ctx.fillRect(x, y + 15, TILE_SIZE, 2);
    ctx.fillRect(x, y + 23, TILE_SIZE, 2);
    ctx.fillRect(x, y + 31, TILE_SIZE, 1);

    // Vertical mortar joints
    ctx.fillRect(x + 7, y, 2, 8);
    ctx.fillRect(x + 23, y, 2, 8);

    ctx.fillRect(x + 15, y + 8, 2, 8);

    ctx.fillRect(x + 7, y + 16, 2, 8);
    ctx.fillRect(x + 23, y + 16, 2, 8);

    ctx.fillRect(x + 15, y + 24, 2, 8);

    // Brick highlights (retro 3D depth)
    ctx.fillStyle = '#d9632d';
    ctx.fillRect(x + 1, y + 1, 6, 2);
    ctx.fillRect(x + 9, y + 1, 14, 2);
    ctx.fillRect(x + 25, y + 1, 6, 2);

    ctx.fillRect(x + 1, y + 9, 14, 2);
    ctx.fillRect(x + 17, y + 9, 14, 2);

    ctx.fillRect(x + 1, y + 17, 6, 2);
    ctx.fillRect(x + 9, y + 17, 14, 2);
    ctx.fillRect(x + 25, y + 17, 6, 2);
  }

  private drawSteelTile(x: number, y: number) {
    const ctx = this.ctx;
    // Steel base plate
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // 4 sub-blocks of steel
    const half = TILE_SIZE / 2; // 16
    for (let bx = 0; bx < 2; bx++) {
      for (let by = 0; by < 2; by++) {
        const sx = x + bx * half;
        const sy = y + by * half;

        // Bevel light
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(sx + 1, sy + 1, half - 2, 2);
        ctx.fillRect(sx + 1, sy + 1, 2, half - 2);

        // Center plate
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(sx + 3, sy + 3, half - 6, half - 6);

        // Specular dot
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 5, sy + 5, 4, 4);

        // Shadow border
        ctx.fillStyle = '#555555';
        ctx.fillRect(sx + 1, sy + half - 2, half - 2, 2);
        ctx.fillRect(sx + half - 2, sy + 1, 2, half - 2);
      }
    }
  }

  private drawBaseAlive(x: number, y: number) {
    const ctx = this.ctx;
    // Dark background for base pedestal
    ctx.fillStyle = '#111111';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Gold Eagle crest
    ctx.fillStyle = '#facc15'; // bright gold

    // Wings
    ctx.fillRect(x + 4, y + 10, 24, 12);
    ctx.fillRect(x + 2, y + 8, 28, 4);
    ctx.fillRect(x + 6, y + 6, 20, 3);

    // Eagle Head & Beak
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 12, y + 3, 8, 7);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 15, y + 6, 5, 3); // Beak
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 14, y + 5, 2, 2); // Eye

    // Shield body
    ctx.fillStyle = '#ef4444'; // Red shield
    ctx.fillRect(x + 11, y + 13, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 13, y + 15, 6, 6);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 14, y + 16, 4, 4);

    // Base pedestal
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(x + 8, y + 24, 16, 6);
  }

  private drawBaseDead(x: number, y: number) {
    const ctx = this.ctx;
    // Destroyed base ruin
    ctx.fillStyle = '#262626';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Debris rubble
    ctx.fillStyle = '#525252';
    ctx.fillRect(x + 4, y + 14, 8, 12);
    ctx.fillRect(x + 16, y + 18, 12, 10);
    ctx.fillRect(x + 10, y + 8, 12, 8);

    // Ash / smoke marks
    ctx.fillStyle = '#171717';
    ctx.fillRect(x + 6, y + 10, 6, 6);
    ctx.fillRect(x + 20, y + 12, 6, 8);

    // Giant Red Death Mark
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', x + TILE_SIZE / 2, y + TILE_SIZE / 2);
  }

  public drawTank(tank: Tank) {
    if (!tank.active) return;
    const ctx = this.ctx;
    const cx = tank.x + tank.size / 2;
    const cy = tank.y + tank.size / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((tank.dir * 90 * Math.PI) / 180);

    const s = tank.size; // e.g. 28
    const half = s / 2;

    // Determine colors
    let mainColor = tank.color;
    let trackColor = '#3f3f46';
    let trackHighlight = '#71717a';

    if (!tank.isPlayer && tank.enemyType === EnemyType.ARMOR) {
      if (tank.armor === 3) mainColor = '#16a34a';
      else if (tank.armor === 2) mainColor = '#eab308';
      else mainColor = '#93c5fd';
    }

    // Animated Treads (tracks)
    const offset = tank.trackFrame === 1 ? 2 : 0;
    ctx.fillStyle = trackColor;
    ctx.fillRect(-half, -half, 6, s);
    ctx.fillRect(half - 6, -half, 6, s);

    // Tread segments
    ctx.fillStyle = trackHighlight;
    for (let ty = -half + offset; ty < half; ty += 6) {
      ctx.fillRect(-half, ty, 6, 2);
      ctx.fillRect(half - 6, ty, 6, 2);
    }

    // Main hull
    ctx.fillStyle = mainColor;
    ctx.fillRect(-half + 5, -half + 3, s - 10, s - 6);

    // Front hull slope
    ctx.fillStyle = tank.isPlayer ? '#fef08a' : '#ffffff';
    ctx.fillRect(-half + 6, -half + 3, s - 12, 3);

    // Turret center base
    ctx.fillStyle = '#27272a';
    ctx.fillRect(-6, -6, 12, 12);
    ctx.fillStyle = mainColor;
    ctx.fillRect(-5, -5, 10, 10);

    // Turret hatch dot
    ctx.fillStyle = tank.isPlayer ? '#b45309' : '#52525b';
    ctx.fillRect(-2, -2, 4, 4);

    // Cannon / Barrel pointing forward (Dir 0 is UP, so -Y)
    ctx.fillStyle = '#e4e4e7';
    ctx.fillRect(-2, -half - 2, 4, 10);
    ctx.fillStyle = mainColor;
    ctx.fillRect(-2, -half - 1, 4, 4);

    ctx.restore();

    // Shield aura if player has shield
    if (tank.shieldTimer && tank.shieldTimer > 0) {
      this.drawShield(cx, cy, tank.shieldTimer);
    }
  }

  private drawShield(cx: number, cy: number, timer: number) {
    const ctx = this.ctx;
    ctx.save();
    const r = 18;
    const angleOffset = (timer * 0.15) % (Math.PI * 2);
    const count = 6;

    for (let i = 0; i < count; i++) {
      const angle = angleOffset + (i * Math.PI * 2) / count;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      ctx.fillStyle = timer % 4 < 2 ? '#60a5fa' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public drawBullet(bullet: Bullet) {
    if (!bullet.active) return;
    const ctx = this.ctx;
    ctx.fillStyle = bullet.isPlayer ? '#ffffff' : '#f87171';
    ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);

    // Bullet tip glow
    ctx.fillStyle = bullet.isPlayer ? '#fef08a' : '#fca5a5';
    ctx.fillRect(bullet.x + 1, bullet.y + 1, bullet.w - 2, bullet.h - 2);
  }

  public drawExplosions(explosions: Explosion[]) {
    const ctx = this.ctx;
    explosions.forEach(exp => {
      const progress = exp.timer / 15; // 0 to 1
      const curRadius = exp.radius + (exp.maxRadius - exp.radius) * (1 - progress);

      // Outer fireball
      ctx.fillStyle = progress > 0.6 ? '#dc2626' : progress > 0.3 ? '#ea580c' : '#facc15';
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, curRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner white blast
      if (progress > 0.4) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, curRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  public drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
  }
}
