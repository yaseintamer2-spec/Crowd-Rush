import { GAME_CONFIG } from './config';
import type {
  GameState, Character, Gate, Obstacle, Particle, FinalDoor, Coin, Zombie, Bullet, GunUpgrade,
} from './types';
import { getLevelMeta } from './levels';

const { PATH_WIDTH, HUD_HEIGHT, BANNER_HEIGHT } = GAME_CONFIG;

function getPathBounds(canvasWidth: number) {
  const pathLeft = (canvasWidth - PATH_WIDTH) / 2;
  return { pathLeft, pathRight: pathLeft + PATH_WIDTH };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w <= 0 || h <= 0) return;
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

function lighten(hex: string, amount: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.min(255, (n >> 16) + amount)},${Math.min(255, ((n >> 8) & 0xff) + amount)},${Math.min(255, (n & 0xff) + amount)})`;
}

function darken(hex: string, amount: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.max(0, (n >> 16) - amount)},${Math.max(0, ((n >> 8) & 0xff) - amount)},${Math.max(0, (n & 0xff) - amount)})`;
}

function getObjectScale(screenY: number, canvasHeight: number, crowdScreenY: number) {
  const t = clamp((screenY - HUD_HEIGHT) / Math.max(1, crowdScreenY - HUD_HEIGHT), 0, 1.15);
  return 0.34 + t * 0.96;
}

function drawGunSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, tint = '#11151d') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.08);
  ctx.fillStyle = tint;
  roundRect(ctx, -9 * scale, -2.6 * scale, 17 * scale, 5.4 * scale, 1.6 * scale);
  ctx.fill();
  roundRect(ctx, 7 * scale, -1.8 * scale, 11 * scale, 2.6 * scale, 1 * scale);
  ctx.fill();
  roundRect(ctx, -4 * scale, 2 * scale, 4 * scale, 6.6 * scale, 1.2 * scale);
  ctx.fill();
  roundRect(ctx, -7 * scale, -4 * scale, 5 * scale, 2.4 * scale, 1 * scale);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, -2 * scale, -1.5 * scale, 8 * scale, 1.2 * scale, 0.4 * scale);
  ctx.fill();
  ctx.restore();
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  char: Character,
  time: number,
  gunLevel: number,
  isLeader: boolean
) {
  const bob = Math.sin(time * 11 + char.bobPhase) * 2.4;
  const stride = Math.sin(time * 13 + char.runPhase);
  const s = char.scale * (isLeader ? 1.08 : 1);
  const cy = y + bob;
  const body = char.color;
  const bodyDark = darken(body, 34);
  const head = lighten(body, 38);

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x, cy + 22 * s, 16 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = bodyDark;
  ctx.lineWidth = 4.1 * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, cy - 6 * s);
  ctx.lineTo(x, cy + 9 * s);
  ctx.moveTo(x - 2 * s, cy - 1 * s);
  ctx.lineTo(x - 13 * s - stride * 3.5 * s, cy + 6 * s);
  ctx.moveTo(x + 2 * s, cy - 1 * s);
  ctx.lineTo(x + 11 * s + stride * 2 * s, cy + 2 * s);
  ctx.moveTo(x, cy + 9 * s);
  ctx.lineTo(x - 8 * s - stride * 5 * s, cy + 22 * s);
  ctx.moveTo(x, cy + 9 * s);
  ctx.lineTo(x + 8 * s + stride * 5 * s, cy + 22 * s);
  ctx.stroke();

  const bodyGrad = ctx.createLinearGradient(x - 10 * s, cy - 6 * s, x + 10 * s, cy + 12 * s);
  bodyGrad.addColorStop(0, lighten(body, 30));
  bodyGrad.addColorStop(1, darken(body, 8));
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, x - 7.5 * s, cy - 8 * s, 15 * s, 18 * s, 5 * s);
  ctx.fill();

  ctx.fillStyle = head;
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.8 * s;
  ctx.beginPath();
  ctx.arc(x, cy - 17 * s, 8.3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0c0c0c';
  ctx.beginPath();
  ctx.arc(x - 2.5 * s, cy - 18.5 * s, 1.2 * s, 0, Math.PI * 2);
  ctx.arc(x + 2.5 * s, cy - 18.5 * s, 1.2 * s, 0, Math.PI * 2);
  ctx.fill();

  const muzzleX = x + 14 * s + Math.max(0, gunLevel - 1) * 1.2;
  drawGunSilhouette(ctx, muzzleX, cy + 1.5 * s, 0.6 * s + gunLevel * 0.03, '#131821');

  if (isLeader) {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, cy - 17 * s, 13 * s, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, scrollY: number, levelNum: number) {
  const meta = getLevelMeta(levelNum);
  const { pathLeft, pathRight } = getPathBounds(width);
  const horizonY = HUD_HEIGHT + 78;
  const laneW = PATH_WIDTH / 3;
  const isDark = meta.twist === 'darkRun';

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  if (isDark) {
    sky.addColorStop(0, '#09101f');
    sky.addColorStop(0.5, '#162446');
    sky.addColorStop(1, '#27442f');
  } else {
    sky.addColorStop(0, '#69c6ff');
    sky.addColorStop(0.42, '#aee6ff');
    sky.addColorStop(1, '#5fbf74');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = isDark ? '#14263c' : '#74c56c';
  ctx.fillRect(0, horizonY, width, height - horizonY);

  for (let i = 0; i < 8; i++) {
    const bx = (i / 8) * width;
    const bw = 55 + (i % 3) * 24;
    const bh = 28 + ((i * 19) % 46);
    ctx.fillStyle = isDark ? 'rgba(8,12,18,0.6)' : 'rgba(24,67,50,0.2)';
    ctx.fillRect(bx - 10, horizonY - bh, bw, bh);
  }

  const leftSlope = 54;
  const rightSlope = width - 54;
  ctx.fillStyle = '#35404a';
  ctx.beginPath();
  ctx.moveTo(pathLeft, height);
  ctx.lineTo(pathRight, height);
  ctx.lineTo(rightSlope, horizonY);
  ctx.lineTo(leftSlope, horizonY);
  ctx.closePath();
  ctx.fill();

  const roadShade = ctx.createLinearGradient(pathLeft, 0, pathRight, 0);
  roadShade.addColorStop(0, '#26323c');
  roadShade.addColorStop(0.5, '#4d5963');
  roadShade.addColorStop(1, '#26323c');
  ctx.fillStyle = roadShade;
  ctx.beginPath();
  ctx.moveTo(pathLeft + 26, height);
  ctx.lineTo(pathRight - 26, height);
  ctx.lineTo(rightSlope - 18, horizonY);
  ctx.lineTo(leftSlope + 18, horizonY);
  ctx.closePath();
  ctx.fill();

  const lanePalette = [
    'rgba(255,88,88,0.16)',
    'rgba(103,255,117,0.13)',
    'rgba(108,195,255,0.15)',
  ];
  for (let i = 0; i < 3; i++) {
    const bottomLeft = pathLeft + i * laneW;
    const bottomRight = bottomLeft + laneW;
    const topLeft = leftSlope + i * (rightSlope - leftSlope) / 3;
    const topRight = leftSlope + (i + 1) * (rightSlope - leftSlope) / 3;
    ctx.fillStyle = lanePalette[i];
    ctx.beginPath();
    ctx.moveTo(bottomLeft, height);
    ctx.lineTo(bottomRight, height);
    ctx.lineTo(topRight, horizonY);
    ctx.lineTo(topLeft, horizonY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 3;
  for (let i = 1; i < 3; i++) {
    const bottomX = pathLeft + laneW * i;
    const topX = leftSlope + ((rightSlope - leftSlope) / 3) * i;
    ctx.beginPath();
    ctx.moveTo(bottomX, height);
    ctx.lineTo(topX, horizonY);
    ctx.stroke();
  }

  const dashOffset = scrollY % 120;
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(255,255,255,0.56)';
  for (let i = 0; i < 9; i++) {
    const y = height - ((i * 115 + dashOffset) % (height - horizonY));
    const t = clamp((y - horizonY) / (height - horizonY), 0, 1);
    const centerX = width / 2;
    const laneScale = 0.14 + t * 0.7;
    const segW = 6 + laneScale * 26;
    ctx.beginPath();
    ctx.moveTo(centerX - segW, y);
    ctx.lineTo(centerX + segW, y);
    ctx.stroke();
  }

  const glow = ctx.createLinearGradient(0, horizonY - 24, 0, horizonY + 140);
  glow.addColorStop(0, isDark ? 'rgba(142,180,255,0.2)' : 'rgba(255,255,255,0.46)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, horizonY - 24, width, 150);
}

function drawGate(ctx: CanvasRenderingContext2D, gate: Gate, screenY: number, canvasWidth: number) {
  const { pathLeft, pathRight } = getPathBounds(canvasWidth);
  const mid = canvasWidth / 2;
  const h = GAME_CONFIG.GATE_HEIGHT;
  ctx.save();
  if (gate.flashTimer > 0) ctx.globalAlpha = Math.min(1, gate.flashTimer / 10);
  ctx.fillStyle = gate.leftColor + '44';
  roundRect(ctx, pathLeft, screenY, mid - pathLeft - 10, h, 16);
  ctx.fill();
  ctx.fillStyle = gate.rightColor + '44';
  roundRect(ctx, mid + 10, screenY, pathRight - mid - 10, h, 16);
  ctx.fill();
  ctx.fillStyle = '#eaf4ff';
  ctx.font = '900 28px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(gate.leftLabel, (pathLeft + mid) / 2, screenY + 60);
  ctx.fillText(gate.rightLabel, (pathRight + mid) / 2, screenY + 60);
  ctx.restore();
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  screenY: number,
  canvasWidth: number,
  crowdScreenY: number,
  canvasHeight: number
) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const ox = pathLeft + obs.x * PATH_WIDTH - obs.width / 2;
  const scale = getObjectScale(screenY, canvasHeight, crowdScreenY);
  const w = obs.width * scale;
  const h = obs.height * scale;

  ctx.save();
  ctx.translate(ox + obs.width / 2, screenY);
  if (obs.flashTimer > 0) ctx.globalAlpha = 0.55 + Math.sin(obs.flashTimer * 0.6) * 0.35;

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, h + 8, w * 0.55, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#59636d';
  roundRect(ctx, -w / 2, 0, w, h, 10 * scale);
  ctx.fill();

  ctx.fillStyle = '#f0b23b';
  for (let i = 0; i < 4; i++) {
    const stripeY = 8 * scale + i * 12 * scale;
    roundRect(ctx, -w * 0.42, stripeY, w * 0.84, 6 * scale, 3 * scale);
    ctx.fill();
  }

  ctx.fillStyle = '#23272b';
  roundRect(ctx, -w * 0.12, h * 0.18, w * 0.24, h * 0.64, 4 * scale);
  ctx.fill();
  ctx.restore();
}

function drawZombie(
  ctx: CanvasRenderingContext2D,
  zombie: Zombie,
  screenY: number,
  canvasWidth: number,
  crowdScreenY: number,
  canvasHeight: number
) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const zx = pathLeft + zombie.x * PATH_WIDTH;
  const scale = getObjectScale(screenY, canvasHeight, crowdScreenY);
  const alpha = zombie.hit ? 0.34 : 1;

  ctx.save();
  ctx.translate(zx, screenY);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 28, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const skin = zombie.hit ? '#6b6f74' : '#7bc567';
  const skinDark = zombie.hit ? '#4d5054' : '#3e7b35';
  const torsoGrad = ctx.createLinearGradient(-10, -4, 10, 28);
  torsoGrad.addColorStop(0, lighten(skin, 12));
  torsoGrad.addColorStop(1, darken(skin, 18));

  ctx.fillStyle = torsoGrad;
  roundRect(ctx, -10, -4, 20, 26, 7);
  ctx.fill();

  ctx.fillStyle = lighten(skin, 16);
  ctx.strokeStyle = '#172112';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -17, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.arc(-4, -19, 1.8, 0, Math.PI * 2);
  ctx.arc(4, -19, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = skinDark;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 3);
  ctx.lineTo(-18, 10);
  ctx.moveTo(6, 1);
  ctx.lineTo(18, -2);
  ctx.moveTo(-4, 22);
  ctx.lineTo(-10, 37);
  ctx.moveTo(4, 22);
  ctx.lineTo(10, 38);
  ctx.stroke();

  const healthRatio = zombie.health / zombie.maxHealth;
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  roundRect(ctx, -18, -37, 36, 6, 3);
  ctx.fill();
  ctx.fillStyle = healthRatio > 0.5 ? '#6dff7a' : healthRatio > 0.2 ? '#ffcf52' : '#ff5e5e';
  roundRect(ctx, -18, -37, 36 * healthRatio, 6, 3);
  ctx.fill();
  ctx.restore();
}

function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.save();
  const grad = ctx.createLinearGradient(bullet.x, bullet.y - 16, bullet.x, bullet.y + 4);
  grad.addColorStop(0, 'rgba(255,245,170,0)');
  grad.addColorStop(1, '#fff59d');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bullet.x, bullet.y - 14);
  ctx.lineTo(bullet.x, bullet.y + 2);
  ctx.stroke();
  ctx.fillStyle = '#ffe56b';
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGunUpgrade(
  ctx: CanvasRenderingContext2D,
  upgrade: GunUpgrade,
  screenY: number,
  canvasWidth: number,
  time: number,
  crowdScreenY: number,
  canvasHeight: number
) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const ux = pathLeft + upgrade.x * PATH_WIDTH;
  const scale = getObjectScale(screenY, canvasHeight, crowdScreenY);
  const bob = Math.sin(time * 4 + upgrade.bobPhase) * 4;

  ctx.save();
  ctx.translate(ux, screenY + bob);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const crate = ctx.createLinearGradient(-24, -10, 24, 18);
  crate.addColorStop(0, '#335f8e');
  crate.addColorStop(1, '#122e4b');
  ctx.fillStyle = crate;
  roundRect(ctx, -24, -10, 48, 28, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.stroke();

  drawGunSilhouette(ctx, 0, -1, 1.05, '#ecf6ff');

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '900 8px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UP', 0, 12);
  ctx.restore();
}

function drawRecruitPickup(
  ctx: CanvasRenderingContext2D,
  coin: Coin,
  screenY: number,
  canvasWidth: number,
  time: number,
  crowdScreenY: number,
  canvasHeight: number
) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const cx = pathLeft + coin.x * PATH_WIDTH;
  const scale = getObjectScale(screenY, canvasHeight, crowdScreenY);
  const bob = Math.sin(time * 4 + coin.bobPhase) * 4;

  ctx.save();
  ctx.translate(cx, screenY + bob);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
  glow.addColorStop(0, 'rgba(167,255,144,0.88)');
  glow.addColorStop(1, 'rgba(87,255,120,0.16)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#dfffe5';
  ctx.beginPath();
  ctx.arc(0, -8, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#44d75c';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(0, 14);
  ctx.moveTo(-7, 4);
  ctx.lineTo(7, 4);
  ctx.moveTo(0, 14);
  ctx.lineTo(-6, 24);
  ctx.moveTo(0, 14);
  ctx.lineTo(6, 24);
  ctx.stroke();
  ctx.restore();
}

function drawFinalDoor(
  ctx: CanvasRenderingContext2D,
  door: FinalDoor,
  screenY: number,
  canvasWidth: number,
  currentCrowd: number
) {
  const { pathLeft } = getPathBounds(canvasWidth);
  const w = PATH_WIDTH;
  const h = GAME_CONFIG.DOOR_HEIGHT + 18;
  const canBreak = currentCrowd >= door.requiredSize;

  ctx.save();
  if (door.broken) {
    ctx.globalAlpha = Math.max(0, door.breakTimer / 30);
    const split = (45 - door.breakTimer) * 3;
    ctx.fillStyle = '#8a5a39';
    roundRect(ctx, pathLeft - split, screenY, w / 2 - 4, h, 8);
    ctx.fill();
    roundRect(ctx, pathLeft + w / 2 + 4 + split, screenY, w / 2 - 4, h, 8);
    ctx.fill();
    ctx.fillStyle = '#ffe36c';
    ctx.font = '900 26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BREACH', canvasWidth / 2, screenY + h / 2 + 8);
    ctx.restore();
    return;
  }

  const wallGrad = ctx.createLinearGradient(pathLeft, screenY, pathLeft + w, screenY + h);
  wallGrad.addColorStop(0, canBreak ? '#377cbe' : '#8e6643');
  wallGrad.addColorStop(1, canBreak ? '#20486f' : '#6f4d31');
  ctx.fillStyle = wallGrad;
  roundRect(ctx, pathLeft, screenY, w, h, 10);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let py = screenY + 9; py < screenY + h; py += 22) {
    ctx.fillRect(pathLeft + 14, py, w - 28, 3);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(pathLeft + w / 2 - 3, screenY, 6, h);

  ctx.fillStyle = '#f5f8fb';
  ctx.font = '900 15px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`BREACH ${door.requiredSize}`, canvasWidth / 2, screenY + h / 2 - 6);
  ctx.fillStyle = canBreak ? '#b7ff60' : '#ffd4c9';
  ctx.font = '900 13px Inter, sans-serif';
  ctx.fillText(canBreak ? 'CRUSH THROUGH' : `${currentCrowd}/${door.requiredSize}`, canvasWidth / 2, screenY + h / 2 + 16);
  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const alpha = p.life / p.maxLife;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (p.text) {
    const scale = 0.5 + alpha * 0.55;
    ctx.font = `900 ${19 * scale}px Inter, sans-serif`;
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

  for (const upgrade of state.gunUpgrades) {
    if (!upgrade.collected) {
      const sy = worldToScreen(upgrade.worldY);
      if (sy > HUD_HEIGHT - 40 && sy < canvasHeight) {
        drawGunUpgrade(ctx, upgrade, sy, canvasWidth, time, crowdScreenY, canvasHeight);
      }
    }
  }

  for (const zombie of state.zombies) {
    if (!zombie.hit) {
      const sy = worldToScreen(zombie.worldY);
      if (sy > HUD_HEIGHT - 40 && sy < canvasHeight) {
        drawZombie(ctx, zombie, sy, canvasWidth, crowdScreenY, canvasHeight);
      }
    }
  }

  for (const bullet of state.bullets) {
    if (bullet.y > HUD_HEIGHT - 40 && bullet.y < canvasHeight) drawBullet(ctx, bullet);
  }

  for (const coin of state.coins) {
    if (!coin.collected) {
      const sy = worldToScreen(coin.worldY);
      if (sy > HUD_HEIGHT - 30 && sy < canvasHeight) {
        drawRecruitPickup(ctx, coin, sy, canvasWidth, time, crowdScreenY, canvasHeight);
      }
    }
  }

  for (const obs of state.obstacles) {
    const sy = worldToScreen(obs.worldY);
    if (sy > HUD_HEIGHT - 60 && sy < canvasHeight + 60) {
      drawObstacle(ctx, obs, sy, canvasWidth, crowdScreenY, canvasHeight);
    }
  }

  for (const gate of state.gates) {
    if (!(gate.passed && gate.flashTimer <= 0)) {
      const sy = worldToScreen(gate.worldY);
      if (sy > HUD_HEIGHT - GAME_CONFIG.GATE_HEIGHT && sy < canvasHeight + 20) {
        drawGate(ctx, gate, sy, canvasWidth);
      }
    }
  }

  if (state.finalDoor) {
    const sy = worldToScreen(state.finalDoor.worldY);
    if (sy > HUD_HEIGHT - 120 && sy < canvasHeight + 120) {
      drawFinalDoor(ctx, state.finalDoor, sy, canvasWidth, state.crowdSize);
    }
  }

  const crowdCX = pathLeft + state.crowdX * PATH_WIDTH;
  for (let i = 0; i < state.characters.length; i++) {
    const char = state.characters[i];
    const cx = crowdCX + char.offsetX;
    const cy = crowdScreenY + char.offsetY;
    if (cy > HUD_HEIGHT - 40 && cy < canvasHeight) {
      drawCharacter(ctx, cx, cy, char, time, state.gunLevel, i === 0);
    }
  }

  for (const p of state.particles) drawParticle(ctx, p);
}

export function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  levelLabel: string,
  totalLength: number
) {
  const hudH = HUD_HEIGHT;
  const hud = ctx.createLinearGradient(0, 0, 0, hudH);
  hud.addColorStop(0, 'rgba(6,10,18,0.98)');
  hud.addColorStop(1, 'rgba(10,16,24,0.86)');
  ctx.fillStyle = hud;
  ctx.fillRect(0, 0, canvasWidth, hudH);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(0, hudH);
  ctx.lineTo(canvasWidth, hudH);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.52)';
  ctx.font = '900 10px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SQUAD', 18, 18);
  ctx.fillStyle = '#7dff90';
  ctx.font = '900 30px Inter, sans-serif';
  ctx.fillText(String(state.crowdSize), 18, 52);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.textAlign = 'center';
  ctx.font = '900 12px Inter, sans-serif';
  ctx.fillText(`LEVEL ${state.level}`, canvasWidth / 2, 18);
  ctx.fillStyle = '#a9d6ff';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(levelLabel, canvasWidth / 2, 32);

  const bw = 118;
  const bh = 7;
  const bx = canvasWidth / 2 - bw / 2;
  const by = 46;
  const prog = Math.min(1, state.crowdProgress / totalLength);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, bx, by, bw, bh, 4);
  ctx.fill();
  const bar = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  bar.addColorStop(0, '#45d26f');
  bar.addColorStop(1, '#4cb2ff');
  ctx.fillStyle = bar;
  roundRect(ctx, bx, by, bw * prog, bh, 4);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.52)';
  ctx.font = '900 10px Inter, sans-serif';
  ctx.fillText('WEAPON', 120, 18);
  ctx.fillStyle = '#9adaff';
  ctx.font = '900 21px Inter, sans-serif';
  ctx.fillText(`MK ${state.gunLevel}`, 120, 46);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.52)';
  ctx.font = '900 10px Inter, sans-serif';
  ctx.fillText('SCORE', canvasWidth - 18, 18);
  ctx.fillStyle = '#ffd76a';
  ctx.font = '900 24px Inter, sans-serif';
  ctx.fillText(String(state.score), canvasWidth - 18, 50);
}
