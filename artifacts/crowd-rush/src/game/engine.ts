import { GAME_CONFIG, SKINS, BLUE_SHADES } from './config';
import type {
  GameState, Character, Gate, Obstacle, Particle, Coin, Zombie, Bullet, GunUpgrade, LevelDef,
} from './types';
import { generateLevel } from './levels';

let nextId = 0;
const uid = () => ++nextId;

export function buildFormation(count: number, colors: string[] = BLUE_SHADES): Character[] {
  const chars: Character[] = [];
  if (count <= 0) return chars;
  const radius = GAME_CONFIG.CHARACTER_RADIUS * 2.6;
  const rings = [1, 6, 12, 18, 24, 30, 36, 42, 48];
  let placed = 0;

  chars.push({
    id: uid(),
    offsetX: 0,
    offsetY: 0,
    color: colors[0],
    bobPhase: Math.random() * Math.PI * 2,
    runPhase: Math.random() * Math.PI * 2,
    scale: 1,
  });
  placed++;

  let ring = 1;
  while (placed < count && ring < rings.length) {
    const inRing = rings[ring];
    const r = ring * radius;
    for (let i = 0; i < inRing && placed < count; i++) {
      const angle = (i / inRing) * Math.PI * 2 + ring * 0.3;
      chars.push({
        id: uid(),
        offsetX: Math.cos(angle) * r + (Math.random() - 0.5) * 5,
        offsetY: Math.sin(angle) * r * 0.5 + (Math.random() - 0.5) * 5,
        color: colors[placed % colors.length],
        bobPhase: Math.random() * Math.PI * 2,
        runPhase: Math.random() * Math.PI * 2,
        scale: 0.82 + Math.random() * 0.32,
      });
      placed++;
    }
    ring++;
  }

  return chars;
}

export function initLevel(levelNum: number, skinId = 'blue'): GameState {
  const def = generateLevel(levelNum);
  const skin = SKINS.find((s) => s.id === skinId) ?? SKINS[0];

  const gates: Gate[] = def.gates.map((g) => ({
    ...g,
    id: uid(),
    passed: false,
    flashTimer: 0,
  }));

  const obstacles: Obstacle[] = def.obstacles.map((o) => ({
    ...o,
    id: uid(),
    hit: false,
    flashTimer: 0,
  }));

  const zombies: Zombie[] = def.zombies.map((z) => ({
    ...z,
    id: uid(),
    hit: false,
    flashTimer: 0,
  }));

  const gunUpgrades: GunUpgrade[] = def.gunUpgrades.map((u) => ({
    ...u,
    id: uid(),
    collected: false,
    bobPhase: Math.random() * Math.PI * 2,
  }));

  const coins: Coin[] = def.coins.map((c) => ({
    ...c,
    id: uid(),
    collected: false,
    bobPhase: Math.random() * Math.PI * 2,
  }));

  const finalDoor = {
    worldY: def.length - 320,
    requiredSize: def.requiredCrowd,
    broken: false,
    breakTimer: 0,
  };

  const characters = buildFormation(
    Math.min(def.startCrowd, GAME_CONFIG.MAX_VISIBLE_CHARACTERS),
    skin.colors
  );

  return {
    phase: 'playing',
    level: levelNum,
    crowdX: 0.5,
    crowdSize: def.startCrowd,
    crowdProgress: 0,
    characters,
    gates,
    obstacles,
    zombies,
    bullets: [],
    particles: [],
    finalDoor,
    coins,
    gunUpgrades,
    score: 0,
    coinsCollected: 0,
    gunLevel: 1,
    shootCooldown: 0,
    time: 0,
    usedRevive: false,
    showingDoorShake: false,
    showCountChange: null,
    activeSkinId: skinId,
  };
}

function spawnParticles(
  state: GameState, x: number, y: number,
  color: string, count: number, text?: string
) {
  if (text) {
    state.particles.push({ id: uid(), x, y, vx: 0, vy: -2.5, life: 60, maxLife: 60, color, size: 16, text });
    return;
  }
  const particleCount = Math.min(count, 10);
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    state.particles.push({
      id: uid(), x, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 24 + Math.random() * 18, maxLife: 42,
      color, size: 4 + Math.random() * 5,
    });
  }
}

function applyCountChange(state: GameState, newSize: number, x: number, y: number) {
  const diff = newSize - state.crowdSize;
  const color = diff >= 0 ? '#76FF03' : '#FF5252';
  const text = diff >= 0 ? `+${diff}` : `${diff}`;
  spawnParticles(state, x, y, color, 0, text);
  state.showCountChange = { value: diff, timer: 60 };
}

export function updateGame(
  state: GameState,
  dt: number,
  inputX: number | null,
  isShooting: boolean,
  canvasWidth: number,
  canvasHeight: number,
  levelDef: LevelDef
): GameState {
  if (state.phase !== 'playing') return state;

  const next = { ...state };
  next.particles = [...state.particles];
  next.gates = [...state.gates];
  next.obstacles = [...state.obstacles];
  next.zombies = [...state.zombies];
  next.bullets = [...state.bullets];
  next.coins = [...state.coins];
  next.gunUpgrades = [...state.gunUpgrades];
  next.time += dt;

  if (inputX !== null) {
    const tx = Math.max(0.07, Math.min(0.93, inputX));
    next.crowdX = next.crowdX + (tx - next.crowdX) * 0.16;
  }

  const gameHeight = canvasHeight - GAME_CONFIG.HUD_HEIGHT - GAME_CONFIG.BANNER_HEIGHT;
  const crowdScreenY = GAME_CONFIG.HUD_HEIGHT + gameHeight * GAME_CONFIG.CROWD_CENTER_Y_RATIO;
  const pathLeft = (canvasWidth - GAME_CONFIG.PATH_WIDTH) / 2;
  const crowdCX = pathLeft + next.crowdX * GAME_CONFIG.PATH_WIDTH;

  next.crowdProgress += levelDef.speed * dt;

  next.shootCooldown = Math.max(0, next.shootCooldown - dt * 60);
  if (isShooting && next.shootCooldown <= 0) {
    next.bullets.push({
      id: uid(),
      x: crowdCX,
      y: crowdScreenY - 24,
      vx: 0,
      vy: -10 - next.gunLevel * 0.6,
    });
    next.shootCooldown = Math.max(6, 12 - next.gunLevel * 2);
    spawnParticles(next, crowdCX, crowdScreenY - 24, '#ffffff', 3);
  }

  next.particles = next.particles
    .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.09, life: p.life - 1 }))
    .filter((p) => p.life > 0);

  next.bullets = next.bullets
    .map((b) => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
    .filter((b) => b.y > -50);

  next.gates = next.gates.map((g) => ({ ...g, flashTimer: Math.max(0, g.flashTimer - 1) }));
  next.obstacles = next.obstacles.map((o) => ({ ...o, flashTimer: Math.max(0, o.flashTimer - 1) }));
  next.zombies = next.zombies.map((z) => ({ ...z, flashTimer: Math.max(0, z.flashTimer - 1) }));
  next.gunUpgrades = next.gunUpgrades.map((u) => ({ ...u }));

  if (next.showCountChange) {
    next.showCountChange = { ...next.showCountChange, timer: next.showCountChange.timer - 1 };
    if (next.showCountChange.timer <= 0) next.showCountChange = null;
  }

  const skin = SKINS.find((s) => s.id === next.activeSkinId) ?? SKINS[0];

  const bulletDamage = 1 + Math.floor(next.gunLevel / 2);
  const activeBullets: Bullet[] = [];
  for (const bullet of next.bullets) {
    let collided = false;
    for (let zi = 0; zi < next.zombies.length; zi++) {
      const zombie = next.zombies[zi];
      if (zombie.hit) continue;
      const zsy = crowdScreenY - (zombie.worldY - next.crowdProgress);
      const zx = pathLeft + zombie.x * GAME_CONFIG.PATH_WIDTH;
      if (Math.abs(bullet.x - zx) < 24 && Math.abs(bullet.y - zsy) < 28) {
        const newHealth = Math.max(0, zombie.health - bulletDamage);
        next.zombies[zi] = { ...zombie, health: newHealth, hit: newHealth <= 0, flashTimer: 20 };
        const color = newHealth <= 0 ? '#76FF03' : '#FFCA28';
        spawnParticles(next, zx, zsy, color, newHealth <= 0 ? 12 : 6);
        if (newHealth <= 0) {
          next.score += 60;
          spawnParticles(next, zx, zsy - 20, '#76FF03', 0, 'ZOMBIE');
        }
        collided = true;
        break;
      }
    }
    if (!collided) activeBullets.push(bullet);
  }
  next.bullets = activeBullets;

  for (let i = 0; i < next.gunUpgrades.length; i++) {
    const upgrade = next.gunUpgrades[i];
    if (upgrade.collected) continue;
    const usy = crowdScreenY - (upgrade.worldY - next.crowdProgress);
    const ux = pathLeft + upgrade.x * GAME_CONFIG.PATH_WIDTH;
    if (Math.abs(ux - crowdCX) < 55 && Math.abs(usy - crowdScreenY) < 45) {
      next.gunUpgrades[i] = { ...upgrade, collected: true };
      next.gunLevel = Math.min(5, next.gunLevel + 1);
      next.score += 150;
      spawnParticles(next, ux, usy, '#42A5F5', 10, 'GUN +1');
    }
  }

  // Gate collisions
  for (let i = 0; i < next.gates.length; i++) {
    const gate = next.gates[i];
    if (gate.passed) continue;
    const gsy = crowdScreenY - (gate.worldY - next.crowdProgress);
    if (gsy > crowdScreenY - 20 && gsy < crowdScreenY + 20) {
      const isLeft = next.crowdX < 0.5;
      const oldSize = next.crowdSize;
      const newSize = Math.max(0, isLeft ? gate.leftOp(next.crowdSize) : gate.rightOp(next.crowdSize));
      next.crowdSize = newSize;
      applyCountChange(next, newSize, crowdCX, crowdScreenY - 40);
      spawnParticles(next, crowdCX, crowdScreenY, newSize >= oldSize ? '#76FF03' : '#FF5252', 8);
      next.gates[i] = { ...gate, passed: true, passedSide: isLeft ? 'left' : 'right', flashTimer: 20 };
      next.score += Math.max(0, next.crowdSize - oldSize) * 10;
      next.characters = buildFormation(Math.min(next.crowdSize, GAME_CONFIG.MAX_VISIBLE_CHARACTERS), skin.colors);
    }
  }

  // Obstacle collisions
  for (let i = 0; i < next.obstacles.length; i++) {
    const obs = next.obstacles[i];
    if (obs.hit) continue;
    const osy = crowdScreenY - (obs.worldY - next.crowdProgress);
    const ox = pathLeft + obs.x * GAME_CONFIG.PATH_WIDTH - obs.width / 2;
    const oRight = ox + obs.width;
    const cr = GAME_CONFIG.CHARACTER_RADIUS * 3;
    if (osy > crowdScreenY - cr && osy < crowdScreenY + cr && crowdCX + cr > ox - 20 && crowdCX - cr < oRight + 20) {
      const dmg = Math.min(next.crowdSize, GAME_CONFIG.OBSTACLE_DAMAGE + Math.floor(state.level / 3));
      const newSize = Math.max(0, next.crowdSize - dmg);
      applyCountChange(next, newSize, crowdCX, crowdScreenY - 40);
      spawnParticles(next, crowdCX, crowdScreenY, '#FF5252', 8);
      next.crowdSize = newSize;
      next.obstacles[i] = { ...obs, hit: true, flashTimer: 25 };
      next.characters = buildFormation(Math.min(next.crowdSize, GAME_CONFIG.MAX_VISIBLE_CHARACTERS), skin.colors);
    }
  }

  // Coin collisions
  for (let i = 0; i < next.coins.length; i++) {
    const coin = next.coins[i];
    if (coin.collected) continue;
    const csy = crowdScreenY - (coin.worldY - next.crowdProgress);
    const cx = pathLeft + coin.x * GAME_CONFIG.PATH_WIDTH;
    if (Math.abs(cx - crowdCX) < 55 && Math.abs(csy - crowdScreenY) < 45) {
      next.coins[i] = { ...coin, collected: true };
      next.coinsCollected += 1;
      spawnParticles(next, cx, csy, '#FFD700', 8);
      spawnParticles(next, cx, csy - 20, '#FFD700', 0, '+coin');
      next.score += 100;
    }
  }

  // Final door
  if (next.finalDoor && !next.finalDoor.broken) {
    const dsy = crowdScreenY - (next.finalDoor.worldY - next.crowdProgress);
    if (dsy > crowdScreenY - 30 && dsy < crowdScreenY + 30) {
      if (next.crowdSize >= next.finalDoor.requiredSize) {
        next.finalDoor = { ...next.finalDoor, broken: true, breakTimer: 45 };
        spawnParticles(next, canvasWidth / 2, dsy, '#FFD700', 12);
        spawnParticles(next, canvasWidth / 2, dsy, '#76FF03', 10);
        spawnParticles(next, canvasWidth / 2, dsy - 40, '#FFD700', 0, 'SMASHED!');
        next.score += next.crowdSize * 50 + 500;
        next.coinsCollected += Math.floor(next.crowdSize / 5);
      } else {
        next.phase = next.usedRevive ? 'gameOver' : 'rewardedAd';
      }
    }
    if (next.finalDoor.broken && next.finalDoor.breakTimer > 0) {
      next.finalDoor = { ...next.finalDoor, breakTimer: next.finalDoor.breakTimer - 1 };
      if (next.finalDoor.breakTimer <= 0) next.phase = 'levelComplete';
    }
  }

  if (next.crowdSize <= 0) {
    next.crowdSize = 0;
    next.phase = next.usedRevive ? 'gameOver' : 'rewardedAd';
  }

  if (next.crowdProgress >= levelDef.length && next.phase === 'playing') {
    next.phase = 'levelComplete';
  }

  return next;
}
