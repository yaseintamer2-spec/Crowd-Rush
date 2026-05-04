import { GAME_CONFIG } from './config';
import type { GameState, Character, Gate, Obstacle, Particle, FinalDoor, Coin } from './types';
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
  const bob = Math.sin(time * 7 + char.bobPhase) * 3;
  const s = char.scale;
  const cy = y + bob;
  const legSwing = Math.sin(time * 9 + char.runPhase);

  ctx.save();
  ctx.fillStyle = char.color;

  // Drop shadow
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#000033';
  ctx.beginPath();
  ctx.ellipse(x, cy + 22 * s, 9 * s, 3.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = char.color;

  // Left leg
  ctx.save();
  ctx.translate(x - 4 * s, cy + 8 * s);
  ctx.rotate(-legSwing * 0.45);
  pill(ctx, 5 * s, 13 * s);
  ctx.fill();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + 4 * s, cy + 8 * s);
  ctx.rotate(legSwing * 0.45);
  pill(ctx, 5 * s, 13 * s);
  ctx.fill();
  ctx.restore();

  // Body
  bodyRect(ctx, x - 7 * s, cy - 8 * s, 14 * s, 19 * s, 5 * s);
  ctx.fill();

  // Left arm
  ctx.save();
  ctx.translate(x - 10 * s, cy - 4 * s);
  ctx.rotate(legSwing * 0.4);
  pill(ctx, 4.5 * s, 11 * s);
  ctx.fill();
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(x + 10 * s, cy - 4 * s);
  ctx.rotate(-legSwing * 0.4);
  pill(ctx, 4.5 * s, 11 * s);
  ctx.fill();
  ctx.restore();

  // Head
  ctx.beginPath();
  ctx.arc(x, cy - 13 * s, 7 * s, 0, Math.PI * 2);
  ctx.fill();

  // Subtle highlight on head
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#90CAF9';
  ctx.beginPath();
  ctx.arc(x - 2 * s, cy - 15 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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

  // Sky
  const skyGrad = ctx.createLinearGradient(0, HUD_HEIGHT, 0, HUD_HEIGHT + (height - HUD_HEIGHT) * 0.45);
  if (isDark) {
    skyGrad.addColorStop(0, '#0a0a1a');
    skyGrad.addColorStop(1, '#111125');
  } else {
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(1, '#C5E8F7');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, HUD_HEIGHT, width, height);

  // Grass
  const grassL = isDark ? '#1a2a1a' : '#4CAF50';
  const grassD = isDark ? '#0d150d' : '#388E3C';
  const grassGrad = ctx.createLinearGradient(0, 0, 0, height);
  grassGrad.addColorStop(0, grassL);
  grassGrad.addColorStop(1, grassD);
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, HUD_HEIGHT, pathLeft, height);
  ctx.fillRect(pathRight, HUD_HEIGHT, width - pathRight, height);

  // Grass stripes
  ctx.save();
  ctx.globalAlpha = 0.12;
  const stripeOff = scrollY % 60;
  for (let y = HUD_HEIGHT - stripeOff; y < height; y += 60) {
    ctx.fillStyle = isDark ? '#112211' : '#2E7D32';
    ctx.fillRect(0, y, pathLeft, 10);
    ctx.fillRect(pathRight, y, width - pathRight, 10);
  }
  ctx.restore();

  // Path
  const pathGrad = ctx.createLinearGradient(pathLeft, 0, pathRight, 0);
  if (isDark) {
    pathGrad.addColorStop(0, '#1a1a2e');
    pathGrad.addColorStop(0.1, '#22223b');
    pathGrad.addColorStop(0.5, '#2a2a4a');
    pathGrad.addColorStop(0.9, '#22223b');
    pathGrad.addColorStop(1, '#1a1a2e');
  } else {
    pathGrad.addColorStop(0, '#8D6E63');
    pathGrad.addColorStop(0.1, '#A1887F');
    pathGrad.addColorStop(0.5, '#BCAAA4');
    pathGrad.addColorStop(0.9, '#A1887F');
    pathGrad.addColorStop(1, '#8D6E63');
  }
  ctx.fillStyle = pathGrad;
  ctx.fillRect(pathLeft, HUD_HEIGHT, PATH_WIDTH, height);

  // Lane dash
  ctx.save();
  ctx.setLineDash([32, 22]);
  ctx.strokeStyle = isDark ? 'rgba(100,100,255,0.2)' : 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  const cx = width / 2;
  ctx.lineDashOffset = scrollY % 54;
  ctx.beginPath();
  ctx.moveTo(cx, HUD_HEIGHT);
  ctx.lineTo(cx, height);
  ctx.stroke();
  ctx.restore();

  // Path edge shadows
  const sw = 24;
  const ls = ctx.createLinearGradient(pathLeft, 0, pathLeft + sw, 0);
  ls.addColorStop(0, 'rgba(0,0,0,0.4)');
  ls.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ls;
  ctx.fillRect(pathLeft, HUD_HEIGHT, sw, height);
  const rs = ctx.createLinearGradient(pathRight - sw, 0, pathRight, 0);
  rs.addColorStop(0, 'rgba(0,0,0,0)');
  rs.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = rs;
  ctx.fillRect(pathRight - sw, HUD_HEIGHT, sw, height);
}

/* ─── Gate ─── */
function drawGate(ctx: CanvasRenderingContext2D, gate: Gate, screenY: number, canvasWidth: number, time: number) {
  const { pathLeft, pathRight } = getPathBounds(canvasWidth);
  const cx = canvasWidth / 2;
  const h = GAME_CONFIG.GATE_HEIGHT;
  const pw = 18;

  if (gate.passed && gate.flashTimer <= 0) return;

  ctx.save();
  if (gate.flashTimer > 0) ctx.globalAlpha = Math.min(1, gate.flashTimer / 8);

  // Left backing
  ctx.fillStyle = gate.leftColor + '28';
  ctx.fillRect(pathLeft, screenY, cx - pathLeft - pw / 2, h);

  // Right backing
  ctx.fillStyle = gate.rightColor + '28';
  ctx.fillRect(cx + pw / 2, screenY, pathRight - cx - pw / 2, h);

  // Left frame
  drawGateArch(ctx, pathLeft, screenY, cx - pathLeft - pw / 2, h, gate.leftColor, pw, time);

  // Right frame
  drawGateArch(ctx, cx + pw / 2, screenY, pathRight - cx - pw / 2, h, gate.rightColor, pw, time);

  // Center pillar
  const cpg = ctx.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0);
  cpg.addColorStop(0, '#333');
  cpg.addColorStop(0.5, '#888');
  cpg.addColorStop(1, '#333');
  ctx.fillStyle = cpg;
  ctx.fillRect(cx - pw / 2, screenY, pw, h + 8);

  // Labels
  ctx.shadowBlur = 6;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.min(30, 30)}px 'Inter', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(gate.leftLabel, (pathLeft + cx) / 2, screenY + h / 2 + 10);
  ctx.fillText(gate.rightLabel, (pathRight + cx) / 2, screenY + h / 2 + 10);
  ctx.shadowBlur = 0;

  // Pulse top bar
  const glow = Math.sin(time * 3) * 0.15 + 0.85;
  ctx.globalAlpha = (gate.flashTimer > 0 ? Math.min(1, gate.flashTimer / 8) : 1) * 0.4 * glow;
  ctx.fillStyle = gate.leftColor;
  ctx.fillRect(pathLeft, screenY, cx - pathLeft - pw / 2, 5);
  ctx.fillStyle = gate.rightColor;
  ctx.fillRect(cx + pw / 2, screenY, pathRight - cx - pw / 2, 5);

  ctx.restore();
}

function drawGateArch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, pw: number, time: number) {
  const r = 10;
  // Pillars
  const pg = ctx.createLinearGradient(x, 0, x + pw, 0);
  pg.addColorStop(0, darken(color, 30));
  pg.addColorStop(0.5, lighten(color, 15));
  pg.addColorStop(1, darken(color, 30));
  ctx.fillStyle = pg;
  roundRect(ctx, x, y, pw, h, r);
  ctx.fill();
  roundRect(ctx, x + w - pw, y, pw, h, r);
  ctx.fill();
  // Top beam
  ctx.fillRect(x, y, w, pw);
  // Glow
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = lighten(color, 25);
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, pw);
  ctx.restore();
}

/* ─── Obstacle ─── */
function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, screenY: number, canvasWidth: number) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const ox = pathLeft + obs.x * PATH_WIDTH - obs.width / 2;

  ctx.save();
  if (obs.flashTimer > 0) ctx.globalAlpha = 0.5 + Math.sin(obs.flashTimer * 2) * 0.5;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(ox + 4, screenY + 6, obs.width, obs.height);

  const grad = ctx.createLinearGradient(ox, screenY, ox, screenY + obs.height);
  grad.addColorStop(0, '#EF5350');
  grad.addColorStop(0.5, '#D32F2F');
  grad.addColorStop(1, '#B71C1C');
  ctx.fillStyle = grad;
  roundRect(ctx, ox, screenY, obs.width, obs.height, 8);
  ctx.fill();

  // Hazard stripes
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#fff';
  const sw = 18;
  for (let sx = ox - obs.height; sx < ox + obs.width + obs.height; sx += sw * 2) {
    ctx.beginPath();
    ctx.moveTo(sx, screenY);
    ctx.lineTo(sx + sw, screenY);
    ctx.lineTo(sx + sw + obs.height, screenY + obs.height);
    ctx.lineTo(sx + obs.height, screenY + obs.height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.globalAlpha = 1;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 3;
  ctx.fillText('WALL', ox + obs.width / 2, screenY + obs.height / 2 + 4);
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
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 14;

  const cg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  cg.addColorStop(0, '#FFF9C4');
  cg.addColorStop(0.6, '#FFD700');
  cg.addColorStop(1, '#F57F17');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#E65100';
  ctx.font = `bold ${r}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowBlur = 0;
  ctx.fillText('$', cx, cy + r * 0.35);
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
  const h = GAME_CONFIG.DOOR_HEIGHT;
  const canBreak = currentCrowd >= door.requiredSize;

  ctx.save();
  if (door.broken) {
    const shake = Math.sin(door.breakTimer * 1.5) * (door.breakTimer / 30) * 12;
    ctx.translate(shake, 0);
    ctx.globalAlpha = Math.max(0, door.breakTimer / 30);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(pathLeft + 4, screenY + 6, w, h);

  // Door body
  const grad = ctx.createLinearGradient(pathLeft, screenY, pathLeft + w, screenY + h);
  grad.addColorStop(0, canBreak ? '#1E88E5' : '#8D6E63');
  grad.addColorStop(0.5, canBreak ? '#1565C0' : '#6D4C41');
  grad.addColorStop(1, canBreak ? '#0D47A1' : '#4E342E');
  ctx.fillStyle = grad;
  roundRect(ctx, pathLeft, screenY, w, h, 10);
  ctx.fill();

  // Panel lines
  ctx.save();
  ctx.clip();
  for (let py = screenY; py < screenY + h; py += 22) {
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(pathLeft, py + 10, w, 2);
  }
  for (let i = 1; i < 4; i++) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(pathLeft + (w / 4) * i - 2, screenY, 4, h);
  }
  ctx.restore();

  // Handles
  ctx.fillStyle = canBreak ? '#FFD700' : '#9E9E9E';
  ctx.shadowColor = canBreak ? '#FFD700' : 'transparent';
  ctx.shadowBlur = canBreak ? 12 : 0;
  [[0.375], [0.625]].forEach(([f]) => {
    ctx.beginPath();
    ctx.arc(pathLeft + w * f, screenY + h / 2, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // Text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText(`NEED ${door.requiredSize}`, canvasWidth / 2, screenY + h / 2 - 6);
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = canBreak ? '#76FF03' : '#FF5252';
  ctx.fillText(canBreak ? '✓ SMASH IT!' : `${currentCrowd}/${door.requiredSize}`, canvasWidth / 2, screenY + h / 2 + 14);

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
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.fillText(p.text, p.x, p.y);
  } else {
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
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
  const sorted = [...state.characters].sort((a, b) => a.offsetY - b.offsetY);
  const crowdCX = pathLeft + state.crowdX * PATH_WIDTH;
  for (const char of sorted) {
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
  ctx.shadowColor = '#76FF03';
  ctx.shadowBlur = 12;
  ctx.fillText(String(state.crowdSize), 18, 54);
  ctx.shadowBlur = 0;

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

  // Score
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('SCORE', canvasWidth - 18, 19);
  ctx.font = 'bold 26px Inter, sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 8;
  ctx.fillText(String(state.score), canvasWidth - 18, 52);
  ctx.shadowBlur = 0;
}

function lighten(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.min(255, (n >> 16) + a)},${Math.min(255, ((n >> 8) & 0xff) + a)},${Math.min(255, (n & 0xff) + a)})`;
}
function darken(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.max(0, (n >> 16) - a)},${Math.max(0, ((n >> 8) & 0xff) - a)},${Math.max(0, (n & 0xff) - a)})`;
}
