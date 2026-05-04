export type GamePhase =
  | 'home'
  | 'playing'
  | 'levelComplete'
  | 'gameOver'
  | 'interstitialAd'
  | 'rewardedAd';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Character {
  id: number;
  offsetX: number;
  offsetY: number;
  color: string;
  bobPhase: number;
  runPhase: number;
  scale: number;
}

export interface Gate {
  id: number;
  worldY: number;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
  leftOp: (n: number) => number;
  rightOp: (n: number) => number;
  passed: boolean;
  passedSide?: 'left' | 'right';
  flashTimer: number;
}

export interface Obstacle {
  id: number;
  worldY: number;
  x: number;
  width: number;
  height: number;
  hit: boolean;
  flashTimer: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string;
}

export interface FinalDoor {
  worldY: number;
  requiredSize: number;
  broken: boolean;
  breakTimer: number;
}

export interface Coin {
  id: number;
  worldY: number;
  x: number;
  collected: boolean;
  bobPhase: number;
}

export interface LevelDef {
  id: number;
  label: string;
  startCrowd: number;
  speed: number;
  length: number;
  gates: Omit<Gate, 'id' | 'passed' | 'flashTimer'>[];
  obstacles: Omit<Obstacle, 'id' | 'hit' | 'flashTimer'>[];
  coins: Omit<Coin, 'id' | 'collected' | 'bobPhase'>[];
  requiredCrowd: number;
}

export interface GameState {
  phase: GamePhase;
  level: number;
  crowdX: number;
  crowdSize: number;
  crowdProgress: number;
  characters: Character[];
  gates: Gate[];
  obstacles: Obstacle[];
  particles: Particle[];
  finalDoor: FinalDoor | null;
  coins: Coin[];
  score: number;
  coinsCollected: number;
  time: number;
  usedRevive: boolean;
  showingDoorShake: boolean;
  showCountChange: { value: number; timer: number } | null;
  activeSkinId: string;
}
