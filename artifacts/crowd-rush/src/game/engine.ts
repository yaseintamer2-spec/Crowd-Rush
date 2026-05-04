import { GAME_CONFIG, SKIN_COLORS } from './config';
import type {
  GameState, Character, Gate, Obstacle, Particle, Coin, FinalDoor, LevelDef,
} from './types';
import { LEVELS } from './levels';

let nextId = 0;
const uid = () => ++nextId;

export function buildFormation(count: number): Character[] {
  const chars: Character[] = [];
  const colors = SKIN_COLORS;
  const radius = GAME_CONFIG.CHARACTER_RADIUS * 2.4;
  const rings = [1, 6, 12, 18, 24, 30, 36, 42];
  let placed = 0;
  let ring = 0;

  // Center character
  chars.push({
    id: uid(),
    offsetX: 0,
    offsetY: 0,
    color: colors[0 % colors.length],
    bobPhase: Math.random() * Math.PI * 2,
    runPhase: Math.random() * Math.PI * 2,
    scale: 1,
  });
  placed++;

  ring = 1;
  while (placed < count && ring < rings.length) {
    const inRing = rings[ring];
    const r = ring * radius;
    for (let i = 0; i < inRing && placed < count; i++) {
      const angle = (i / inRing) * Math.PI * 2 + ring * 0.3;
      chars.push({
        id: uid(),
        offsetX: Math.cos(angle) * r + (Math.random() - 0.5) * 4,
        offsetY: Math.sin(angle) * r * 0.5 + (Math.random() - 0.5) * 4,
        color: colors[placed % colors.length],
        bobPhase: Math.random() * Math.PI * 2,
        runPhase: Math.random() * Math.PI * 2,
        scale: 0.85 + Math.random() * 0.3,
      });
      placed++;
    }
    ring++;
  }

  return chars;
}

export function initLevel(levelIndex: number): GameState {
  const def = LEVELS[Math.min(levelIndex, LEVELS.length - 1)];

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

  const coins: Coin[] = def.coins.map((c) => ({
    ...c,
    id: uid(),
    collected: false,
    bobPhase: Math.random() * Math.PI * 2,
  }));

  const finalDoor: FinalDoor = {
    worldY: def.length - 300,
    requiredSize: def.requiredCrowd,
    broken: false,
    breakTimer: 0,
  };

  const characters = buildFormation(Math.min(def.startCrowd, GAME_CONFIG.MAX_VISIBLE_CHARACTERS));

  return {
    phase: 'playing',
    level: levelIndex + 1,
    crowdX: 0.5,
    crowdSize: def.startCrowd,
    crowdProgress: 0,
    characters,
    gates,
    obstacles,
    particles: [],
    finalDoor,
    coins,
    score: 0,
    time: 0,
    usedRevive: false,
    showingDoorShake: false,
    showCountChange: null,
  };
}

function spawnParticles(
  state: GameState,
  x: number,
  y: number,
  color: string,
  count: number,
  text?: string
): void {
  if (text) {
    state.particles.push({
      id: uid(),
      x,
      y,
      vx: 0,
      vy: -2.5,
      life: 60,
      maxLife: 60,
      color,
      size: 16,
      text,
    });
    return;
  }
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    state.particles.push({
      id: uid(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 30,
      maxLife: 60,
      color,
      size: 4 + Math.random() * 6,
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
  canvasWidth: number,
  canvasHeight: number,
  levelDef: LevelDef
): GameState {
  if (state.phase !== 'playing') return state;

  const next = { ...state };
  next.particles = [...state.particles];
  next.gates = [...state.gates];
  next.obstacles = [...state.obstacles];
  next.coins = [...state.coins];
  next.time += dt;

  // Move crowd X toward input
  if (inputX !== null) {
    const targetX = Math.max(0.08, Math.min(0.92, inputX));
    next.crowdX = next.crowdX + (targetX - next.crowdX) * 0.18;
  }

  // Advance crowd forward
  const speed = levelDef.speed;
  next.crowdProgress += speed;

  // Update particles
  next.particles = next.particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.08,
      life: p.life - 1,
    }))
    .filter((p) => p.life > 0);

  // Update flash timers
  next.gates = next.gates.map((g) => ({
    ...g,
    flashTimer: Math.max(0, g.flashTimer - 1),
  }));
  next.obstacles = next.obstacles.map((o) => ({
    ...o,
    flashTimer: Math.max(0, o.flashTimer - 1),
  }));

  // Update show count change
  if (next.showCountChange) {
    next.showCountChange = {
      ...next.showCountChange,
      timer: next.showCountChange.timer - 1,
    };
    if (next.showCountChange.timer <= 0) next.showCountChange = null;
  }

  const gameHeight = canvasHeight - GAME_CONFIG.HUD_HEIGHT - GAME_CONFIG.BANNER_HEIGHT;
  const crowdScreenY = GAME_CONFIG.HUD_HEIGHT + gameHeight * GAME_CONFIG.CROWD_CENTER_Y_RATIO;
  const pathLeft = (canvasWidth - GAME_CONFIG.PATH_WIDTH) / 2;
  const crowdCenterX = pathLeft + next.crowdX * GAME_CONFIG.PATH_WIDTH;

  // Check gate collisions
  for (let i = 0; i < next.gates.length; i++) {
    const gate = next.gates[i];
    if (gate.passed) continue;

    const gateScreenY = crowdScreenY - (gate.worldY - next.crowdProgress);

    if (gateScreenY > crowdScreenY - 20 && gateScreenY < crowdScreenY + 20) {
      const isLeft = next.crowdX < 0.5;
      const oldSize = next.crowdSize;
      const newSize = isLeft ? gate.leftOp(next.crowdSize) : gate.rightOp(next.crowdSize);
      next.crowdSize = Math.max(1, newSize);

      applyCountChange(next, newSize, crowdCenterX, crowdScreenY - 40);
      spawnParticles(
        next,
        crowdCenterX,
        crowdScreenY,
        newSize >= oldSize ? '#76FF03' : '#FF5252',
        12
      );

      next.gates[i] = { ...gate, passed: true, passedSide: isLeft ? 'left' : 'right', flashTimer: 20 };
      next.score += Math.max(0, next.crowdSize - oldSize) * 10;
      next.characters = buildFormation(Math.min(next.crowdSize, GAME_CONFIG.MAX_VISIBLE_CHARACTERS));
    }
  }

  // Check obstacle collisions
  for (let i = 0; i < next.obstacles.length; i++) {
    const obs = next.obstacles[i];
    if (obs.hit) continue;

    const obsScreenY = crowdScreenY - (obs.worldY - next.crowdProgress);
    const obsX = pathLeft + obs.x * GAME_CONFIG.PATH_WIDTH - obs.width / 2;
    const obsRight = obsX + obs.width;
    const charRadius = GAME_CONFIG.CHARACTER_RADIUS * 2.5;

    if (
      obsScreenY > crowdScreenY - charRadius &&
      obsScreenY < crowdScreenY + charRadius &&
      crowdCenterX + charRadius > obsX - 20 &&
      crowdCenterX - charRadius < obsRight + 20
    ) {
      const damage = Math.min(next.crowdSize - 1, GAME_CONFIG.OBSTACLE_DAMAGE);
      const newSize = next.crowdSize - damage;
      applyCountChange(next, newSize, crowdCenterX, crowdScreenY - 40);
      spawnParticles(next, crowdCenterX, crowdScreenY, '#FF5252', 10);
      next.crowdSize = Math.max(1, newSize);
      next.obstacles[i] = { ...obs, hit: true, flashTimer: 25 };
      next.characters = buildFormation(Math.min(next.crowdSize, GAME_CONFIG.MAX_VISIBLE_CHARACTERS));
    }
  }

  // Check coin collisions
  for (let i = 0; i < next.coins.length; i++) {
    const coin = next.coins[i];
    if (coin.collected) continue;

    const coinScreenY = crowdScreenY - (coin.worldY - next.crowdProgress);
    const coinX = pathLeft + coin.x * GAME_CONFIG.PATH_WIDTH;
    const dx = Math.abs(coinX - crowdCenterX);
    const dy = Math.abs(coinScreenY - crowdScreenY);

    if (dx < 50 && dy < 40) {
      next.coins[i] = { ...coin, collected: true };
      spawnParticles(next, coinX, coinScreenY, '#FFD700', 8);
      spawnParticles(next, coinX, coinScreenY - 20, '#FFD700', 0, '+100');
      next.score += 100;
    }
  }

  // Check final door
  if (next.finalDoor && !next.finalDoor.broken) {
    const doorScreenY = crowdScreenY - (next.finalDoor.worldY - next.crowdProgress);

    if (doorScreenY > crowdScreenY - 30 && doorScreenY < crowdScreenY + 30) {
      if (next.crowdSize >= next.finalDoor.requiredSize) {
        // Break through!
        next.finalDoor = { ...next.finalDoor, broken: true, breakTimer: 45 };
        spawnParticles(next, canvasWidth / 2, doorScreenY, '#FFD700', 30);
        spawnParticles(next, canvasWidth / 2, doorScreenY, '#76FF03', 20);
        spawnParticles(next, canvasWidth / 2, doorScreenY - 40, '#FFD700', 0, 'SMASHED!');
        next.score += next.crowdSize * 50 + 500;
      } else {
        // Blocked!
        next.showingDoorShake = true;
        next.phase = 'gameOver';
      }
    }

    if (next.finalDoor.broken && next.finalDoor.breakTimer > 0) {
      next.finalDoor = {
        ...next.finalDoor,
        breakTimer: next.finalDoor.breakTimer - 1,
      };
      if (next.finalDoor.breakTimer <= 0) {
        next.phase = 'levelComplete';
      }
    }
  }

  // Game over if crowd is 0
  if (next.crowdSize <= 0) {
    next.crowdSize = 0;
    next.phase = next.usedRevive ? 'gameOver' : 'rewardedAd';
  }

  // Check if past end of level
  if (next.crowdProgress >= levelDef.length && next.phase === 'playing') {
    next.phase = 'levelComplete';
  }

  return next;
}
