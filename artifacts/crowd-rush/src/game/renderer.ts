import { GAME_CONFIG } from './config';
import type { GameState, Character, Gate, Obstacle, Particle, FinalDoor, Coin, Zombie, Bullet, GunUpgrade } from './types';
import { getLevelMeta } from './levels';

const { PATH_WIDTH, HUD_HEIGHT, BANNER_HEIGHT, GAME_CONFIG: _ } = { ...GAME_CONFIG, GAME_CONFIG: null };

function getPathBounds(canvasWidth: number) {
  const pathLeft = (canvasWidth - PATH_WIDTH) / 2;
  const pathRight = pathLeft + PATH_WIDTH;
  return { pathLeft, pathRight };
}

/* ─── Blue silhouette character ─── */
function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  char: Character,
  time: number
) {
  const bob = Math.sin(time * 10 + char.bobPhase) * 2.2;
  const s = char.scale;
  const cy = y + bob;
  const squash = 1 + Math.sin(time * 12 + char.runPhase) * 0.045;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, cy + 18 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = char.color;
  ctx.beginPath();
  ctx.ellipse(x, cy + 2 * s, 11 * s, 15 * s * squash, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = lighten(char.color, 42);
  ctx.beginPath();
  ctx.arc(x, cy - 14 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();

  // Arms animation
  const armSwing = Math.sin(time * 12 + char.runPhase + Math.PI) * 0.3;
  ctx.strokeStyle = char.color;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 5 * s, cy - 5 * s);
  ctx.lineTo(x - 8 * s + armSwing * 5, cy + 5 * s + armSwing * 3);
  ctx.moveTo(x + 5 * s, cy - 5 * s);
  ctx.lineTo(x + 8 * s - armSwing * 5, cy + 5 * s - armSwing * 3);
  ctx.stroke();

  ctx.globalAlpha = 0.32;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - 3 * s, cy - 17 * s, 2.2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Pill shape centered at (0,0), width w, height h
function pill(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + r, 0);
  ctx.lineTo(w / 2 - r, 0);
  ctx.quadraticCurveTo(w / 2, 0, w / 2, r);
  ctx.lineTo(w / 2, h - r);
  ctx.quadraticCurveTo(w / 2, h, w / 2 - r, h);
  ctx.lineTo(-w / 2 + r, h);
  ctx.quadraticCurveTo(-w / 2, h, -w / 2, h - r);
  ctx.lineTo(-w / 2, r);
  ctx.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
  ctx.closePath();
}

function bodyRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w <= 0) return;
  const ar = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + ar, y);
  ctx.lineTo(x + w - ar, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + ar);
  ctx.lineTo(x + w, y + h - ar);
  ctx.quadraticCurveTo(x + w, y + h, x + w - ar, y + h);
  ctx.lineTo(x + ar, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - ar);
  ctx.lineTo(x, y + ar);
  ctx.quadraticCurveTo(x, y, x + ar, y);
  ctx.closePath();
}

/* ─── Background ─── */
function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, scrollY: number, levelNum: number) {
  const meta = getLevelMeta(levelNum);
  const { pathLeft, pathRight } = getPathBounds(width);
  const isDark = meta.twist === 'darkRun';

  ctx.fillStyle = isDark ? '#111225' : '#5ed36d';
  ctx.fillRect(0, HUD_HEIGHT, width, height);

  ctx.fillStyle = isDark ? '#232445' : '#6f7f92';
  ctx.fillRect(pathLeft, HUD_HEIGHT, PATH_WIDTH, height);

  const stripeOff = scrollY % 80;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)';
  for (let y = HUD_HEIGHT - stripeOff; y < height; y += 80) {
    ctx.fillRect(pathLeft, y, PATH_WIDTH, 3);
  }

  ctx.save();
  ctx.setLineDash([30, 20]);
  ctx.strokeStyle = '#ffffff';
  ctx.globalAlpha = 0.42;
  ctx.lineWidth = 4;
  ctx.lineDashOffset = scrollY % 54;
  ctx.beginPath();
  ctx.moveTo(width / 2, HUD_HEIGHT);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = isDark ? '#7C4DFF' : '#2ad4ff';
  ctx.fillRect(pathLeft - 5, HUD_HEIGHT, 5, height);
  ctx.fillRect(pathRight, HUD_HEIGHT, 5, height);

  ctx.fillStyle = isDark ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)';
  ctx.fillRect(pathLeft, HUD_HEIGHT, 14, height);
  ctx.fillRect(pathRight - 14, HUD_HEIGHT, 14, height);
}

/* ─── Gate ─── */
function drawGate(ctx: CanvasRenderingContext2D, gate: Gate, screenY: number, canvasWidth: number, _time: number) {
  const { pathLeft, pathRight } = getPathBounds(canvasWidth);
  const cx = canvasWidth / 2;
  const h = GAME_CONFIG.GATE_HEIGHT;
  const pw = 18;

  if (gate.passed && gate.flashTimer <= 0) return;

  ctx.save();
  if (gate.flashTimer > 0) ctx.globalAlpha = Math.min(1, gate.flashTimer / 8);

  ctx.fillStyle = gate.leftColor + '44';
  roundRect(ctx, pathLeft, screenY, cx - pathLeft - pw / 2, h, 12);
  ctx.fill();

  ctx.fillStyle = gate.rightColor + '44';
  roundRect(ctx, cx + pw / 2, screenY, pathRight - cx - pw / 2, h, 12);
  ctx.fill();

  drawGateArch(ctx, pathLeft, screenY, cx - pathLeft - pw / 2, h, gate.leftColor, pw);
  drawGateArch(ctx, cx + pw / 2, screenY, pathRight - cx - pw / 2, h, gate.rightColor, pw);

  // Center pillar
  ctx.fillStyle = '#2f3b48';
  ctx.fillRect(cx - pw / 2, screenY, pw, h + 8);

  ctx.fillStyle = 'white';
  ctx.font = `900 34px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(gate.leftLabel, (pathLeft + cx) / 2, screenY + h / 2 + 10);
  ctx.fillText(gate.rightLabel, (pathRight + cx) / 2, screenY + h / 2 + 10);

  ctx.fillStyle = gate.leftColor;
  ctx.fillRect(pathLeft, screenY, cx - pathLeft - pw / 2, 8);
  ctx.fillStyle = gate.rightColor;
  ctx.fillRect(cx + pw / 2, screenY, pathRight - cx - pw / 2, 8);

  ctx.restore();
}

function drawGateArch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, pw: number) {
  const r = 10;
  ctx.fillStyle = color;
  roundRect(ctx, x, y, pw, h, r);
  ctx.fill();
  roundRect(ctx, x + w - pw, y, pw, h, r);
  ctx.fill();
  ctx.fillRect(x, y, w, pw);
}

/* ─── Obstacle ─── */
function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, screenY: number, canvasWidth: number) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const ox = pathLeft + obs.x * PATH_WIDTH - obs.width / 2;

  ctx.save();
  if (obs.flashTimer > 0) ctx.globalAlpha = 0.5 + Math.sin(obs.flashTimer * 2) * 0.5;

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(ox + 5, screenY + 8, obs.width, obs.height + 4);

  ctx.fillStyle = '#ff2f3f';
  roundRect(ctx, ox, screenY, obs.width, obs.height, 8);
  ctx.fill();

  ctx.fillStyle = '#FFE082';
  for (let sx = ox + 10; sx < ox + obs.width - 4; sx += 20) {
    ctx.beginPath();
    ctx.moveTo(sx, screenY - 10);
    ctx.lineTo(sx + 8, screenY);
    ctx.lineTo(sx - 8, screenY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 3;
  ctx.fillText('DANGER', ox + obs.width / 2, screenY + obs.height / 2 + 4);
  ctx.restore();
}

function drawZombie(ctx: CanvasRenderingContext2D, zombie: Zombie, screenY: number, canvasWidth: number) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const zx = pathLeft + zombie.x * PATH_WIDTH;
  const alpha = zombie.hit ? 0.4 : 1;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = zombie.hit ? '#7b7b7b' : '#4caf50';
  ctx.beginPath();
  ctx.arc(zx, screenY - 16, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(zx, screenY - 6);
  ctx.lineTo(zx, screenY + 12);
  ctx.moveTo(zx - 8, screenY + 4);
  ctx.lineTo(zx + 8, screenY + 4);
  ctx.stroke();

  ctx.strokeStyle = '#2e7d32';
  ctx.beginPath();
  ctx.moveTo(zx - 8, screenY + 12);
  ctx.lineTo(zx + 8, screenY + 16);
  ctx.moveTo(zx + 8, screenY + 12);
  ctx.lineTo(zx + 4, screenY + 24);
  ctx.moveTo(zx - 8, screenY + 12);
  ctx.lineTo(zx - 4, screenY + 24);
  ctx.stroke();

  const healthRatio = zombie.health / zombie.maxHealth;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(zx - 18, screenY - 32, 36, 5);
  ctx.fillStyle = healthRatio > 0.5 ? '#76FF03' : healthRatio > 0.2 ? '#FFC107' : '#f44336';
  ctx.fillRect(zx - 18, screenY - 32, 36 * healthRatio, 5);
  ctx.restore();
}

function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.save();
  ctx.fillStyle = '#ffea00';
  ctx.shadowColor = '#ffea00';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGunUpgrade(ctx: CanvasRenderingContext2D, upgrade: GunUpgrade, screenY: number, canvasWidth: number, time: number) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const ux = pathLeft + upgrade.x * PATH_WIDTH;
  const bob = Math.sin(time * 4 + upgrade.bobPhase) * 4;
  ctx.save();
  ctx.translate(ux, screenY + bob);
  ctx.fillStyle = '#42A5F5';
  roundRect(ctx, -16, -16, 32, 32, 8);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(8, 0);
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 8);
  ctx.stroke();
  ctx.restore();
}

/* ─── Coin ─── */
function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin, screenY: number, canvasWidth: number, time: number) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const cx = pathLeft + coin.x * PATH_WIDTH;
  const bob = Math.sin(time * 4 + coin.bobPhase) * 5;
  const cy = screenY + bob;
  const r = GAME_CONFIG.COIN_RADIUS;

  ctx.save();
  ctx.fillStyle = '#76FF03';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 6);
  ctx.lineTo(cx, cy + 6);
  ctx.moveTo(cx - 6, cy);
  ctx.lineTo(cx + 6, cy);
  ctx.stroke();
  ctx.restore();
}

/* ─── Final Door ─── */
function drawFinalDoor(
  ctx: CanvasRenderingContext2D,
  door: FinalDoor,
  screenY: number,
  canvasWidth: number,
  currentCrowd: number,
  time: number
) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const w = PATH_WIDTH;
  const h = GAME_CONFIG.DOOR_HEIGHT + 18;
  const canBreak = currentCrowd >= door.requiredSize;

  ctx.save();
  if (door.broken) {
    ctx.globalAlpha = Math.max(0, door.breakTimer / 30);
    const split = (45 - door.breakTimer) * 3;
    ctx.fillStyle = '#9a6a43';
    roundRect(ctx, pathLeft - split, screenY, w / 2 - 4, h, 8);
    ctx.fill();
    roundRect(ctx, pathLeft + w / 2 + 4 + split, screenY, w / 2 - 4, h, 8);
    ctx.fill();
    ctx.fillStyle = '#FFD54F';
    ctx.font = '900 26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SMASH!', canvasWidth / 2, screenY + h / 2 + 8);
    ctx.restore();
    return;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(pathLeft + 4, screenY + 6, w, h);

  ctx.fillStyle = canBreak ? '#3f8cff' : '#8b5a35';
  roundRect(ctx, pathLeft, screenY, w, h, 10);
  ctx.fill();

  // Wall blocks and crack
  for (let py = screenY; py < screenY + h; py += 22) {
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(pathLeft + 12, py + 10, w - 24, 3);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(pathLeft + w / 2 - 3, screenY, 6, h);
  ctx.strokeStyle = canBreak ? '#ffffff' : '#3d2718';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(pathLeft + w * 0.43, screenY + 18);
  ctx.lineTo(pathLeft + w * 0.5, screenY + 38);
  ctx.lineTo(pathLeft + w * 0.45, screenY + 58);
  ctx.lineTo(pathLeft + w * 0.54, screenY + 82);
  ctx.stroke();

  // Text
  ctx.fillStyle = 'white';
  ctx.font = '900 15px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`NEED ${door.requiredSize}`, canvasWidth / 2, screenY + h / 2 - 6);
  ctx.font = '900 13px Inter, sans-serif';
  ctx.fillStyle = canBreak ? '#B6FF4A' : '#FFD1D1';
  ctx.fillText(canBreak ? 'BREAK WALL' : `${currentCrowd}/${door.requiredSize}`, canvasWidth / 2, screenY + h / 2 + 16);

  ctx.restore();
}

/* ─── Particle ─── */
function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const alpha = p.life / p.maxLife;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (p.text) {
    const scale = 0.5 + alpha * 0.5;
    ctx.font = `bold ${20 * scale}px Inter, sans-serif`;
    ctx.fillStyle = p.color;
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y);
  } else {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ─── Main render ─── */
export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number,
  gameHeight: number,
  time: number
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawBackground(ctx, canvasWidth, canvasHeight, state.crowdProgress, state.level);

  const { pathLeft } = getPathBounds(canvasWidth);
  const crowdScreenY = HUD_HEIGHT + gameHeight * GAME_CONFIG.CROWD_CENTER_Y_RATIO;
  const worldToScreen = (wy: number) => crowdScreenY - (wy - state.crowdProgress);

  // Gun upgrades
  for (const upgrade of state.gunUpgrades) {
    if (!upgrade.collected) {
      const sy = worldToScreen(upgrade.worldY);
      if (sy > HUD_HEIGHT - 40 && sy < canvasHeight) drawGunUpgrade(ctx, upgrade, sy, canvasWidth, time);
    }
  }

  // Zombies
  for (const zombie of state.zombies) {
    if (zombie.hit) continue;
    const sy = worldToScreen(zombie.worldY);
    if (sy > HUD_HEIGHT - 40 && sy < canvasHeight) drawZombie(ctx, zombie, sy, canvasWidth);
  }

  // Bullets
  for (const bullet of state.bullets) {
    if (bullet.y > HUD_HEIGHT - 40 && bullet.y < canvasHeight) drawBullet(ctx, bullet);
  }

  // Coins
  for (const coin of state.coins) {
    if (!coin.collected) {
      const sy = worldToScreen(coin.worldY);
      if (sy > HUD_HEIGHT - 30 && sy < canvasHeight) drawCoin(ctx, coin, sy, canvasWidth, time);
    }
  }

  // Obstacles
  for (const obs of state.obstacles) {
    const sy = worldToScreen(obs.worldY);
    if (sy > HUD_HEIGHT - 60 && sy < canvasHeight + 60) drawObstacle(ctx, obs, sy, canvasWidth);
  }

  // Gates
  for (const gate of state.gates) {
    if (gate.passed && gate.flashTimer <= 0) continue;
    const sy = worldToScreen(gate.worldY);
    if (sy > HUD_HEIGHT - GAME_CONFIG.GATE_HEIGHT && sy < canvasHeight + 20) drawGate(ctx, gate, sy, canvasWidth, time);
  }

  // Final door
  if (state.finalDoor) {
    const sy = worldToScreen(state.finalDoor.worldY);
    if (sy > HUD_HEIGHT - 120 && sy < canvasHeight + 120) {
      drawFinalDoor(ctx, state.finalDoor, sy, canvasWidth, state.crowdSize, time);
    }
  }

  // Crowd characters
  const crowdCX = pathLeft + state.crowdX * PATH_WIDTH;
  for (const char of state.characters) {
    const cx = crowdCX + char.offsetX;
    const cy = crowdScreenY + char.offsetY;
    if (cy > HUD_HEIGHT - 40 && cy < canvasHeight) drawCharacter(ctx, cx, cy, char, time);
  }

  // Particles
  for (const p of state.particles) drawParticle(ctx, p);
}

/* ─── HUD ─── */
export function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  levelLabel: string,
  totalLength: number
) {
  const hudH = HUD_HEIGHT;

  const hg = ctx.createLinearGradient(0, 0, 0, hudH);
  hg.addColorStop(0, 'rgba(8,8,22,0.98)');
  hg.addColorStop(1, 'rgba(8,8,22,0.88)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, canvasWidth, hudH);

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hudH);
  ctx.lineTo(canvasWidth, hudH);
  ctx.stroke();

  // Crowd
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CROWD', 18, 19);
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.fillStyle = '#76FF03';
  ctx.fillText(String(state.crowdSize), 18, 54);

  // Level + progress
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${state.level}`, canvasWidth / 2, 20);
  ctx.fillStyle = '#90CAF9';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(levelLabel, canvasWidth / 2, 33);

  // Progress bar
  const bw = 110, bh = 6, bx = canvasWidth / 2 - bw / 2, by = 46;
  const prog = Math.min(1, state.crowdProgress / totalLength);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, bx, by, bw, bh, 3);
  ctx.fill();
  const barGrad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  barGrad.addColorStop(0, '#42A5F5');
  barGrad.addColorStop(1, '#7C4DFF');
  ctx.fillStyle = barGrad;
  roundRect(ctx, bx, by, bw * prog, bh, 3);
  ctx.fill();

  // Gun power
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GUN LV', 120, 20);
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.fillStyle = '#42A5F5';
  ctx.fillText(String(state.gunLevel), 120, 48);

  // Score
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('SCORE', canvasWidth - 18, 19);
  ctx.font = 'bold 26px Inter, sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(String(state.score), canvasWidth - 18, 52);
}

function lighten(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.min(255, (n >> 16) + a)},${Math.min(255, ((n >> 8) & 0xff) + a)},${Math.min(255, (n & 0xff) + a)})`;
}
function darken(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.max(0, (n >> 16) - a)},${Math.max(0, ((n >> 8) & 0xff) - a)},${Math.max(0, (n & 0xff) - a)})`;
}
