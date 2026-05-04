import type { LevelDef, Gate, Obstacle, Coin } from './types';

const clamp = (n: number) => Math.max(1, Math.round(n));

export type TwistType = 'none' | 'speedRush' | 'megaGates' | 'wallMaze' | 'bonusRain' | 'darkRun' | 'reversedColors' | 'doubleDoor' | 'blitz' | 'jackpot';

export interface LevelMeta {
  twist: TwistType;
  twistLabel: string;
  twistEmoji: string;
  twistColor: string;
}

const TWISTS: { type: TwistType; label: string; emoji: string; color: string }[] = [
  { type: 'speedRush',      label: 'SPEED RUSH',    emoji: '⚡', color: '#FF6D00' },
  { type: 'megaGates',      label: 'MEGA GATES',    emoji: '💥', color: '#AA00FF' },
  { type: 'wallMaze',       label: 'WALL MAZE',     emoji: '🧱', color: '#D50000' },
  { type: 'bonusRain',      label: 'BONUS RAIN',    emoji: '💰', color: '#FFD700' },
  { type: 'darkRun',        label: 'DARK RUN',      emoji: '🌑', color: '#37474F' },
  { type: 'reversedColors', label: 'TRAP GATES',    emoji: '🔀', color: '#E91E63' },
  { type: 'doubleDoor',     label: 'DOUBLE DOOR',   emoji: '🚪', color: '#0091EA' },
  { type: 'blitz',          label: 'BLITZ',         emoji: '🔥', color: '#FF3D00' },
  { type: 'jackpot',        label: 'JACKPOT',       emoji: '🎰', color: '#00BFA5' },
];

export function getLevelMeta(levelNum: number): LevelMeta {
  const isTwist = levelNum % 10 === 0;
  if (!isTwist) return { twist: 'none', twistLabel: '', twistEmoji: '', twistColor: '' };
  const idx = Math.floor(levelNum / 10 - 1) % TWISTS.length;
  const t = TWISTS[idx];
  return { twist: t.type, twistLabel: t.label, twistEmoji: t.emoji, twistColor: t.color };
}

function rng(seed: number, max: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.floor((x - Math.floor(x)) * max);
}

function rngFloat(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function generateLevel(levelNum: number): LevelDef {
  const n = levelNum;
  const meta = getLevelMeta(n);
  const isTwist = meta.twist !== 'none';

  // Progressive difficulty
  let speed = Math.min(7.5, 3.2 + (n - 1) * 0.09);
  if (meta.twist === 'speedRush') speed *= 1.6;
  if (meta.twist === 'blitz') speed *= 1.8;

  const length = Math.min(12000, 3800 + n * 120);
  const startCrowd = Math.max(5, 14 - Math.floor(n / 5));
  const requiredCrowd = 12 + Math.floor(n * 2.8);

  const gateCount = Math.min(12, 3 + Math.floor(n / 2.5));
  let obstacleCount = Math.min(9, Math.floor(n / 2));
  if (meta.twist === 'wallMaze') obstacleCount = Math.min(14, obstacleCount + 6);

  const label = isTwist
    ? `${meta.twistEmoji} ${meta.twistLabel}`
    : `STAGE ${n}`;

  // Gate generation
  const usableLength = length - 900;
  const spacing = usableLength / (gateCount + 1);

  const gates: Omit<Gate, 'id' | 'passed' | 'flashTimer'>[] = [];

  for (let i = 0; i < gateCount; i++) {
    const worldY = 500 + spacing * (i + 1);
    const seed = n * 100 + i;
    const diff = rngFloat(seed);
    const gate = buildGate(n, seed, diff, meta.twist, i, gateCount);
    gates.push({ ...gate, worldY });
  }

  // Obstacle generation
  const obstacles: Omit<Obstacle, 'id' | 'hit' | 'flashTimer'>[] = [];
  const obsSpacing = usableLength / (obstacleCount + 1);

  const xPositions = meta.twist === 'wallMaze'
    ? [0.2, 0.5, 0.75, 0.3, 0.6, 0.15, 0.55, 0.8, 0.35, 0.65, 0.25, 0.45, 0.7, 0.85]
    : [0.22, 0.72, 0.38, 0.62, 0.18, 0.78, 0.45, 0.28, 0.58, 0.82];

  for (let i = 0; i < obstacleCount; i++) {
    const worldY = 500 + obsSpacing * (i + 1);
    const gateNear = gates.find((g) => Math.abs(g.worldY - worldY) < 200);
    if (gateNear) continue;

    const obsW = meta.twist === 'wallMaze' ? 90 + rng(n + i * 7, 40) : 55 + rng(n + i * 7, 50);
    obstacles.push({
      worldY,
      x: xPositions[i % xPositions.length],
      width: obsW,
      height: 32,
    });
  }

  // Coins
  const coins: Omit<Coin, 'id' | 'collected' | 'bobPhase'>[] = [];
  const coinCount = meta.twist === 'bonusRain'
    ? 16 + Math.floor(n / 3)
    : Math.min(10, 4 + Math.floor(n / 4));

  const coinSpacing = usableLength / (coinCount + 1);
  const coinXArr = [0.25, 0.5, 0.75, 0.35, 0.65, 0.45, 0.55, 0.3, 0.7, 0.4, 0.6, 0.2, 0.8, 0.5, 0.33, 0.67];
  for (let i = 0; i < coinCount; i++) {
    coins.push({
      worldY: 400 + coinSpacing * (i + 1),
      x: coinXArr[i % coinXArr.length],
    });
  }

  return {
    id: n,
    label,
    startCrowd,
    speed,
    length,
    gates,
    obstacles,
    coins,
    requiredCrowd,
  };
}

function buildGate(
  level: number,
  seed: number,
  diff: number,
  twist: TwistType,
  gateIndex: number,
  gateTotal: number,
): Omit<Gate, 'id' | 'passed' | 'flashTimer' | 'worldY'> {
  // How tricky: early gates in level are easier
  const earlyBias = gateIndex / gateTotal;
  const hardness = Math.min(1, (level / 40) + earlyBias * 0.3);

  // Choose gate type based on level/hardness
  const r = rngFloat(seed + 1);

  // Jackpot twist: all big multipliers
  if (twist === 'jackpot') {
    const mults = [2, 3, 4, 5, 6];
    const ml = mults[Math.floor(r * mults.length)];
    const mr = mults[Math.floor(rngFloat(seed + 2) * mults.length)];
    return {
      leftLabel: `x${ml}`, rightLabel: `x${mr}`,
      leftColor: '#FFD700', rightColor: '#FFD700',
      leftOp: (n) => clamp(n * ml), rightOp: (n) => clamp(n * mr),
    };
  }

  // Reversed/trap gates: colors are misleading
  if (twist === 'reversedColors') {
    const addVal = 8 + Math.floor(level / 3);
    const multVal = 2 + Math.floor(level / 15);
    const isLeftGood = rngFloat(seed + 3) > 0.5;
    return {
      leftLabel: isLeftGood ? `x${multVal}` : `-${addVal}`,
      rightLabel: isLeftGood ? `-${addVal}` : `x${multVal}`,
      leftColor: isLeftGood ? '#D50000' : '#00C853', // reversed colors!
      rightColor: isLeftGood ? '#00C853' : '#D50000',
      leftOp: isLeftGood ? (n) => clamp(n * multVal) : (n) => clamp(n - addVal),
      rightOp: isLeftGood ? (n) => clamp(n - addVal) : (n) => clamp(n * multVal),
    };
  }

  // Mega gates twist: always big numbers
  if (twist === 'megaGates') {
    const bigMult = 3 + gateIndex;
    const bigSub = Math.floor(level * 1.5);
    return {
      leftLabel: `x${bigMult}`,
      rightLabel: `-${bigSub}`,
      leftColor: '#AA00FF',
      rightColor: '#D50000',
      leftOp: (n) => clamp(n * bigMult),
      rightOp: (n) => clamp(n - bigSub),
    };
  }

  // Normal gate generation
  const addMax = Math.min(50, 5 + Math.floor(level * 1.2));
  const multMax = Math.min(6, 2 + Math.floor(level / 10));
  const subMax = Math.min(40, 3 + Math.floor(level * 0.9));

  const types = hardness < 0.3
    ? ['add_add', 'add_mult']
    : hardness < 0.6
    ? ['add_mult', 'mult_sub', 'add_sub']
    : ['mult_sub', 'add_sub', 'div_mult', 'mult_mult'];

  const type = types[rng(seed + 5, types.length)];

  switch (type) {
    case 'add_add': {
      const l = 4 + rng(seed + 6, addMax);
      const rm = 3 + rng(seed + 7, addMax);
      return {
        leftLabel: `+${l}`, rightLabel: `+${rm}`,
        leftColor: '#00C853', rightColor: '#00BFA5',
        leftOp: (n) => clamp(n + l), rightOp: (n) => clamp(n + rm),
      };
    }
    case 'add_mult': {
      const add = 5 + rng(seed + 6, addMax);
      const mult = 2 + rng(seed + 7, multMax - 1);
      const leftIsAdd = rngFloat(seed + 8) > 0.5;
      return leftIsAdd
        ? {
            leftLabel: `+${add}`, rightLabel: `x${mult}`,
            leftColor: '#00C853', rightColor: '#FF6D00',
            leftOp: (n) => clamp(n + add), rightOp: (n) => clamp(n * mult),
          }
        : {
            leftLabel: `x${mult}`, rightLabel: `+${add}`,
            leftColor: '#FF6D00', rightColor: '#00C853',
            leftOp: (n) => clamp(n * mult), rightOp: (n) => clamp(n + add),
          };
    }
    case 'mult_sub': {
      const mult = 2 + rng(seed + 6, multMax);
      const sub = 5 + rng(seed + 7, subMax);
      return {
        leftLabel: `x${mult}`, rightLabel: `-${sub}`,
        leftColor: '#FF6D00', rightColor: '#D50000',
        leftOp: (n) => clamp(n * mult), rightOp: (n) => clamp(n - sub),
      };
    }
    case 'add_sub': {
      const add = 6 + rng(seed + 6, addMax);
      const sub = 4 + rng(seed + 7, subMax);
      return {
        leftLabel: `+${add}`, rightLabel: `-${sub}`,
        leftColor: '#00C853', rightColor: '#D50000',
        leftOp: (n) => clamp(n + add), rightOp: (n) => clamp(n - sub),
      };
    }
    case 'div_mult': {
      const div = 2 + rng(seed + 6, 2);
      const mult = 2 + rng(seed + 7, multMax);
      return {
        leftLabel: `/÷${div}`, rightLabel: `x${mult}`,
        leftColor: '#D50000', rightColor: '#FF6D00',
        leftOp: (n) => clamp(Math.floor(n / div)), rightOp: (n) => clamp(n * mult),
      };
    }
    case 'mult_mult': {
      const ml = 2 + rng(seed + 6, multMax);
      const mr = 2 + rng(seed + 7, multMax);
      return {
        leftLabel: `x${ml}`, rightLabel: `x${mr}`,
        leftColor: '#FF6D00', rightColor: '#AA00FF',
        leftOp: (n) => clamp(n * ml), rightOp: (n) => clamp(n * mr),
      };
    }
    default: {
      const add = 5 + rng(seed + 6, addMax);
      return {
        leftLabel: `+${add}`, rightLabel: `+${Math.floor(add / 2)}`,
        leftColor: '#00C853', rightColor: '#00BFA5',
        leftOp: (n) => clamp(n + add), rightOp: (n) => clamp(n + Math.floor(add / 2)),
      };
    }
  }
}

// Legacy export for any remaining references
export const LEVELS = [generateLevel(1)];
