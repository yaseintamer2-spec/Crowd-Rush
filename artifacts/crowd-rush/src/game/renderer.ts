import { GAME_CONFIG, SKIN_COLORS } from './config';
import type { GameState, Character, Gate, Obstacle, Particle, FinalDoor, Coin } from './types';

const { PATH_WIDTH, HUD_HEIGHT, BANNER_HEIGHT, CHARACTER_RADIUS } = GAME_CONFIG;

function getPathBounds(canvasWidth: number) {
  const pathLeft = (canvasWidth - PATH_WIDTH) / 2;
  const pathRight = pathLeft + PATH_WIDTH;
  return { pathLeft, pathRight };
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, scrollY: number) {
  const { pathLeft, pathRight } = getPathBounds(width);

  // Sky gradient (top portion)
  const skyGrad = ctx.createLinearGradient(0, HUD_HEIGHT, 0, height * 0.4 + HUD_HEIGHT);
  skyGrad.addColorStop(0, '#87CEEB');
  skyGrad.addColorStop(1, '#B8E4F7');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, HUD_HEIGHT, width, height);

  // Grass left
  const grassGrad = ctx.createLinearGradient(0, 0, 0, height);
  grassGrad.addColorStop(0, '#4CAF50');
  grassGrad.addColorStop(1, '#388E3C');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, HUD_HEIGHT, pathLeft, height);
  ctx.fillRect(pathRight, HUD_HEIGHT, width - pathRight, height);

  // Grass details - stripe pattern
  ctx.save();
  ctx.globalAlpha = 0.15;
  const stripeSpacing = 60;
  const stripeOffset = scrollY % stripeSpacing;
  for (let y = HUD_HEIGHT - stripeOffset; y < height; y += stripeSpacing) {
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, y, pathLeft, 8);
    ctx.fillRect(pathRight, y, width - pathRight, 8);
  }
  ctx.restore();

  // Path - dirt/road
  const pathGrad = ctx.createLinearGradient(pathLeft, 0, pathRight, 0);
  pathGrad.addColorStop(0, '#8D6E63');
  pathGrad.addColorStop(0.1, '#A1887F');
  pathGrad.addColorStop(0.5, '#BCAAA4');
  pathGrad.addColorStop(0.9, '#A1887F');
  pathGrad.addColorStop(1, '#8D6E63');
  ctx.fillStyle = pathGrad;
  ctx.fillRect(pathLeft, HUD_HEIGHT, PATH_WIDTH, height);

  // Lane markers (dashes)
  ctx.save();
  ctx.setLineDash([30, 20]);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  const centerX = width / 2;
  const dashOffset = scrollY % 50;
  ctx.lineDashOffset = dashOffset;
  ctx.beginPath();
  ctx.moveTo(centerX, HUD_HEIGHT);
  ctx.lineTo(centerX, height);
  ctx.stroke();
  ctx.restore();

  // Path edge shadows
  const shadowWidth = 20;
  const leftShadow = ctx.createLinearGradient(pathLeft, 0, pathLeft + shadowWidth, 0);
  leftShadow.addColorStop(0, 'rgba(0,0,0,0.35)');
  leftShadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = leftShadow;
  ctx.fillRect(pathLeft, HUD_HEIGHT, shadowWidth, height);

  const rightShadow = ctx.createLinearGradient(pathRight - shadowWidth, 0, pathRight, 0);
  rightShadow.addColorStop(0, 'rgba(0,0,0,0)');
  rightShadow.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = rightShadow;
  ctx.fillRect(pathRight - shadowWidth, HUD_HEIGHT, shadowWidth, height);
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  char: Character,
  time: number
) {
  const bob = Math.sin(time * 6 + char.bobPhase) * 3;
  const scale = char.scale;
  const bodyR = CHARACTER_RADIUS * scale;
  const headR = GAME_CONFIG.CHARACTER_HEAD_RADIUS * scale;
  const cy = y + bob;

  ctx.save();

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, cy + bodyR + 2, bodyR * 0.8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  const bodyGrad = ctx.createRadialGradient(x - bodyR * 0.3, cy - bodyR * 0.2, 1, x, cy, bodyR);
  bodyGrad.addColorStop(0, lightenColor(char.color, 40));
  bodyGrad.addColorStop(1, char.color);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(x, cy, bodyR, 0, Math.PI * 2);
  ctx.fill();

  // Body outline
  ctx.strokeStyle = darkenColor(char.color, 30);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Arms (running motion)
  const armAngle = Math.sin(time * 8 + char.runPhase) * 0.5;
  ctx.strokeStyle = darkenColor(char.color, 20);
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = 'round';

  // Left arm
  ctx.beginPath();
  ctx.moveTo(x - bodyR * 0.6, cy - bodyR * 0.1);
  ctx.lineTo(x - bodyR * 1.2, cy + bodyR * 0.3 + Math.sin(armAngle) * bodyR * 0.4);
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + bodyR * 0.6, cy - bodyR * 0.1);
  ctx.lineTo(x + bodyR * 1.2, cy + bodyR * 0.3 - Math.sin(armAngle) * bodyR * 0.4);
  ctx.stroke();

  // Head
  const headGrad = ctx.createRadialGradient(x - headR * 0.3, cy - bodyR - headR * 0.2, 1, x, cy - bodyR, headR);
  headGrad.addColorStop(0, lightenColor('#FFCC80', 20));
  headGrad.addColorStop(1, '#FFCC80');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, cy - bodyR, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E6A050';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eyes
  const eyeSize = 2.5 * scale;
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x - headR * 0.35, cy - bodyR - headR * 0.15, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + headR * 0.35, cy - bodyR - headR * 0.15, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  // White eye highlights
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(x - headR * 0.28, cy - bodyR - headR * 0.2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + headR * 0.42, cy - bodyR - headR * 0.2, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#8D4E00';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, cy - bodyR + headR * 0.1, headR * 0.4, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Hair (simple colored blob on top)
  ctx.fillStyle = darkenColor(char.color, 20);
  ctx.beginPath();
  ctx.arc(x, cy - bodyR - headR * 0.7, headR * 0.65, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGate(
  ctx: CanvasRenderingContext2D,
  gate: Gate,
  screenY: number,
  canvasWidth: number,
  time: number
) {
  const { pathLeft, pathRight } = getPathBounds(canvasWidth);
  const centerX = canvasWidth / 2;
  const gateH = GAME_CONFIG.GATE_HEIGHT;
  const pillarW = 16;

  if (gate.passed && gate.flashTimer <= 0) return;

  ctx.save();

  if (gate.flashTimer > 0) {
    ctx.globalAlpha = Math.min(1, gate.flashTimer / 8);
  }

  // Left gate arch
  const leftGrad = ctx.createLinearGradient(pathLeft, screenY, centerX - pillarW, screenY + gateH);
  leftGrad.addColorStop(0, gate.leftColor);
  leftGrad.addColorStop(1, darkenColor(gate.leftColor, 40));

  // Gate backing
  ctx.fillStyle = gate.leftColor + '33';
  ctx.fillRect(pathLeft, screenY, centerX - pathLeft - pillarW / 2, gateH);

  // Arch frame
  drawGateArch(ctx, pathLeft, screenY, centerX - pathLeft - pillarW / 2, gateH, gate.leftColor, pillarW);

  // Right gate arch
  ctx.fillStyle = gate.rightColor + '33';
  ctx.fillRect(centerX + pillarW / 2, screenY, pathRight - centerX - pillarW / 2, gateH);
  drawGateArch(ctx, centerX + pillarW / 2, screenY, pathRight - centerX - pillarW / 2, gateH, gate.rightColor, pillarW);

  // Center pillar
  const pillarGrad = ctx.createLinearGradient(centerX - pillarW / 2, 0, centerX + pillarW / 2, 0);
  pillarGrad.addColorStop(0, '#555');
  pillarGrad.addColorStop(0.5, '#999');
  pillarGrad.addColorStop(1, '#555');
  ctx.fillStyle = pillarGrad;
  ctx.fillRect(centerX - pillarW / 2, screenY, pillarW, gateH + 10);

  // Left label
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.min(28, 28)}px 'Inter', sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText(gate.leftLabel, (pathLeft + centerX) / 2, screenY + gateH / 2 + 10);

  // Right label
  ctx.fillText(gate.rightLabel, (pathRight + centerX) / 2, screenY + gateH / 2 + 10);
  ctx.shadowBlur = 0;

  // Pulse glow on gate (animated)
  const glow = Math.sin(time * 3) * 0.15 + 0.85;
  ctx.globalAlpha = 0.3 * glow;
  ctx.fillStyle = gate.leftColor;
  ctx.fillRect(pathLeft, screenY, centerX - pathLeft - pillarW / 2, 4);
  ctx.fillStyle = gate.rightColor;
  ctx.fillRect(centerX + pillarW / 2, screenY, pathRight - centerX - pillarW / 2, 4);

  ctx.restore();
}

function drawGateArch(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string, pillarW: number
) {
  const radius = 12;

  // Left pillar
  const pillarGrad = ctx.createLinearGradient(x, 0, x + pillarW, 0);
  pillarGrad.addColorStop(0, darkenColor(color, 30));
  pillarGrad.addColorStop(0.5, lightenColor(color, 20));
  pillarGrad.addColorStop(1, darkenColor(color, 30));
  ctx.fillStyle = pillarGrad;
  roundRect(ctx, x, y, pillarW, h, radius);
  ctx.fill();

  // Right pillar
  roundRect(ctx, x + w - pillarW, y, pillarW, h, radius);
  ctx.fill();

  // Top beam
  ctx.fillRect(x, y, w, pillarW);

  // Glow effect
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = lightenColor(color, 30);
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, pillarW);
  ctx.restore();
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  screenY: number,
  canvasWidth: number
) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const obsX = pathLeft + obs.x * GAME_CONFIG.PATH_WIDTH - obs.width / 2;

  ctx.save();

  if (obs.flashTimer > 0) {
    ctx.globalAlpha = 0.5 + Math.sin(obs.flashTimer * 2) * 0.5;
  }

  // Barrier shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(obsX + 4, screenY + 6, obs.width, obs.height);

  // Main barrier body
  const grad = ctx.createLinearGradient(obsX, screenY, obsX, screenY + obs.height);
  grad.addColorStop(0, '#FF5252');
  grad.addColorStop(0.5, '#FF1744');
  grad.addColorStop(1, '#B71C1C');
  ctx.fillStyle = grad;
  roundRect(ctx, obsX, screenY, obs.width, obs.height, 8);
  ctx.fill();

  // Stripes
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#fff';
  const stripeW = 18;
  for (let sx = obsX - obs.height; sx < obsX + obs.width + obs.height; sx += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(sx, screenY);
    ctx.lineTo(sx + stripeW, screenY);
    ctx.lineTo(sx + stripeW + obs.height, screenY + obs.height);
    ctx.lineTo(sx + obs.height, screenY + obs.height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Top highlight
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = 'white';
  ctx.fillRect(obsX + 6, screenY + 4, obs.width - 12, 4);

  // Label
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 3;
  ctx.fillText('BLOCK', obsX + obs.width / 2, screenY + obs.height / 2 + 4);

  ctx.restore();
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  coin: Coin,
  screenY: number,
  canvasWidth: number,
  time: number
) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const cx = pathLeft + coin.x * GAME_CONFIG.PATH_WIDTH;
  const bob = Math.sin(time * 4 + coin.bobPhase) * 5;
  const cy = screenY + bob;
  const r = GAME_CONFIG.COIN_RADIUS;

  ctx.save();

  // Coin glow
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 15;

  // Coin body
  const coinGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  coinGrad.addColorStop(0, '#FFF176');
  coinGrad.addColorStop(0.6, '#FFD700');
  coinGrad.addColorStop(1, '#F57F17');
  ctx.fillStyle = coinGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Coin symbol
  ctx.fillStyle = '#F57F17';
  ctx.font = `bold ${r}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowBlur = 0;
  ctx.fillText('$', cx, cy + r * 0.35);

  ctx.restore();
}

function drawFinalDoor(
  ctx: CanvasRenderingContext2D,
  door: FinalDoor,
  screenY: number,
  canvasWidth: number,
  currentCrowd: number,
  time: number
) {
  const { pathLeft, pathRight } = getPathBounds(canvasWidth);
  const w = PATH_WIDTH;
  const h = GAME_CONFIG.DOOR_HEIGHT;

  ctx.save();

  if (door.broken) {
    ctx.globalAlpha = Math.max(0, door.breakTimer / 30);
    ctx.save();
    ctx.translate(canvasWidth / 2, screenY + h / 2);
    const shake = Math.sin(door.breakTimer * 1.5) * (door.breakTimer / 30) * 10;
    ctx.translate(shake, 0);
    ctx.translate(-canvasWidth / 2, -(screenY + h / 2));
  }

  // Door shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(pathLeft + 4, screenY + 6, w, h);

  // Door body
  const canBreak = currentCrowd >= door.requiredSize;
  const doorColor = canBreak ? '#1565C0' : '#5D4037';
  const grad = ctx.createLinearGradient(pathLeft, screenY, pathLeft + w, screenY + h);
  grad.addColorStop(0, canBreak ? '#1E88E5' : '#8D6E63');
  grad.addColorStop(0.5, canBreak ? '#1565C0' : '#6D4C41');
  grad.addColorStop(1, canBreak ? '#0D47A1' : '#4E342E');
  ctx.fillStyle = grad;
  roundRect(ctx, pathLeft, screenY, w, h, 10);
  ctx.fill();

  // Horizontal planks
  ctx.save();
  ctx.clip();
  for (let py = screenY; py < screenY + h; py += 20) {
    ctx.fillStyle = canBreak ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.15)';
    ctx.fillRect(pathLeft, py + 10, w, 2);
  }

  // Vertical splits
  const panelW = w / 4;
  for (let i = 1; i < 4; i++) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(pathLeft + panelW * i - 2, screenY, 4, h);
  }
  ctx.restore();

  // Metal handles
  ctx.fillStyle = canBreak ? '#FFD700' : '#9E9E9E';
  ctx.shadowColor = canBreak ? '#FFD700' : 'transparent';
  ctx.shadowBlur = canBreak ? 10 : 0;
  ctx.beginPath();
  ctx.arc(pathLeft + w * 0.375, screenY + h / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(pathLeft + w * 0.625, screenY + h / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Required crowd label
  ctx.fillStyle = 'white';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 5;
  ctx.fillText(`NEED ${door.requiredSize}`, canvasWidth / 2, screenY + h / 2 - 5);
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = canBreak ? '#76FF03' : '#FF5252';
  ctx.fillText(canBreak ? '✓ BREAK IT!' : `${currentCrowd}/${door.requiredSize}`, canvasWidth / 2, screenY + h / 2 + 14);

  if (door.broken) {
    ctx.restore();
  }

  ctx.restore();
}

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
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number,
  gameHeight: number,
  time: number
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawBackground(ctx, canvasWidth, canvasHeight, state.crowdProgress);

  const { pathLeft } = getPathBounds(canvasWidth);
  const crowdScreenY = HUD_HEIGHT + gameHeight * GAME_CONFIG.CROWD_CENTER_Y_RATIO;
  const worldToScreen = (worldY: number) =>
    crowdScreenY - (worldY - state.crowdProgress);

  // Draw coins
  for (const coin of state.coins) {
    if (!coin.collected) {
      const sy = worldToScreen(coin.worldY);
      if (sy > HUD_HEIGHT - 30 && sy < canvasHeight) {
        drawCoin(ctx, coin, sy, canvasWidth, time);
      }
    }
  }

  // Draw obstacles
  for (const obs of state.obstacles) {
    const sy = worldToScreen(obs.worldY);
    if (sy > HUD_HEIGHT - 50 && sy < canvasHeight + 50) {
      drawObstacle(ctx, obs, sy, canvasWidth);
    }
  }

  // Draw gates
  for (const gate of state.gates) {
    if (gate.passed && gate.flashTimer <= 0) continue;
    const sy = worldToScreen(gate.worldY);
    if (sy > HUD_HEIGHT - GAME_CONFIG.GATE_HEIGHT && sy < canvasHeight + 20) {
      drawGate(ctx, gate, sy, canvasWidth, time);
    }
  }

  // Draw final door
  if (state.finalDoor) {
    const sy = worldToScreen(state.finalDoor.worldY);
    if (sy > HUD_HEIGHT - 100 && sy < canvasHeight + 100) {
      drawFinalDoor(ctx, state.finalDoor, sy, canvasWidth, state.crowdSize, time);
    }
  }

  // Draw crowd characters (back to front by Y offset)
  const sortedChars = [...state.characters].sort((a, b) => a.offsetY - b.offsetY);
  const crowdCenterX = pathLeft + state.crowdX * GAME_CONFIG.PATH_WIDTH;

  for (const char of sortedChars) {
    const cx = crowdCenterX + char.offsetX;
    const cy = crowdScreenY + char.offsetY;
    if (cy > HUD_HEIGHT - 30 && cy < canvasHeight) {
      drawCharacter(ctx, cx, cy, char, time);
    }
  }

  // Draw particles
  for (const p of state.particles) {
    drawParticle(ctx, p);
  }
}

// Helper: lighten a hex color
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  levelLabel: string,
  totalLength: number
) {
  const { HUD_HEIGHT: hudH } = GAME_CONFIG;

  // HUD background
  const hudGrad = ctx.createLinearGradient(0, 0, 0, hudH);
  hudGrad.addColorStop(0, 'rgba(15,15,30,0.97)');
  hudGrad.addColorStop(1, 'rgba(15,15,30,0.85)');
  ctx.fillStyle = hudGrad;
  ctx.fillRect(0, 0, canvasWidth, hudH);

  // Bottom border
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hudH);
  ctx.lineTo(canvasWidth, hudH);
  ctx.stroke();

  // Crowd count - big and centered-left
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CROWD', 20, 20);

  ctx.font = 'bold 30px Inter, sans-serif';
  ctx.fillStyle = '#76FF03';
  ctx.shadowColor = '#76FF03';
  ctx.shadowBlur = 10;
  ctx.fillText(String(state.crowdSize), 20, 52);
  ctx.shadowBlur = 0;

  // Level name centered
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`LEVEL ${state.level}`, canvasWidth / 2, 20);
  ctx.fillStyle = '#90CAF9';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(levelLabel, canvasWidth / 2, 34);

  // Progress bar
  const barW = 100;
  const barH = 6;
  const barX = canvasWidth / 2 - barW / 2;
  const barY = 46;
  const progress = Math.min(1, state.crowdProgress / totalLength);

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRectHUD(ctx, barX, barY, barW, barH, 3);
  ctx.fill();

  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  barGrad.addColorStop(0, '#42A5F5');
  barGrad.addColorStop(1, '#7C4DFF');
  ctx.fillStyle = barGrad;
  roundRectHUD(ctx, barX, barY, barW * progress, barH, 3);
  ctx.fill();

  // Score right side
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('SCORE', canvasWidth - 20, 20);

  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 8;
  ctx.fillText(String(state.score), canvasWidth - 20, 50);
  ctx.shadowBlur = 0;
}

function roundRectHUD(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  if (w <= 0) return;
  const actualR = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + actualR, y);
  ctx.lineTo(x + w - actualR, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + actualR);
  ctx.lineTo(x + w, y + h - actualR);
  ctx.quadraticCurveTo(x + w, y + h, x + w - actualR, y + h);
  ctx.lineTo(x + actualR, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - actualR);
  ctx.lineTo(x, y + actualR);
  ctx.quadraticCurveTo(x, y, x + actualR, y);
  ctx.closePath();
}
