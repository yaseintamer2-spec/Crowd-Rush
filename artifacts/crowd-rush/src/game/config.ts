export const GAME_CONFIG = {
  PATH_WIDTH: 340,
  CHARACTER_RADIUS: 11,
  CHARACTER_HEAD_RADIUS: 7,
  CROWD_CENTER_Y_RATIO: 0.76,
  HUD_HEIGHT: 70,
  BANNER_HEIGHT: 60,
  GATE_HEIGHT: 100,
  GATE_Y_RANGE: 50,
  OBSTACLE_DAMAGE: 3,
  MAX_VISIBLE_CHARACTERS: 48,
  COIN_RADIUS: 10,
  DOOR_HEIGHT: 80,
  REVIVE_COIN_COST: 60,
  COMBAT_LANE_X: 0.22,
  CROWD_LANE_X: 0.5,
  UPGRADE_LANE_X: 0.8,
} as const;

export interface Skin {
  id: string;
  name: string;
  colors: string[];
  price: number;
  emoji: string;
  gradient: [string, string];
  glowColor: string;
}

export const SKINS: Skin[] = [
  {
    id: 'blue',
    name: 'Classic Blue',
    colors: ['#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5'],
    price: 0,
    emoji: '🔵',
    gradient: ['#1976D2', '#0D47A1'],
    glowColor: 'rgba(33,150,243,0.5)',
  },
  {
    id: 'fire',
    name: 'Fire Squad',
    colors: ['#B71C1C', '#C62828', '#D32F2F', '#E53935', '#EF5350', '#FF5252'],
    price: 200,
    emoji: '🔴',
    gradient: ['#D32F2F', '#B71C1C'],
    glowColor: 'rgba(211,47,47,0.5)',
  },
  {
    id: 'gold',
    name: 'Gold Rush',
    colors: ['#E65100', '#F57C00', '#FB8C00', '#FF9800', '#FFA726', '#FFCC02'],
    price: 500,
    emoji: '🌟',
    gradient: ['#FF9800', '#E65100'],
    glowColor: 'rgba(255,152,0,0.5)',
  },
  {
    id: 'toxic',
    name: 'Toxic Squad',
    colors: ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#69F0AE'],
    price: 800,
    emoji: '☢️',
    gradient: ['#43A047', '#1B5E20'],
    glowColor: 'rgba(67,160,71,0.5)',
  },
  {
    id: 'shadow',
    name: 'Shadow Gang',
    colors: ['#1C1C1E', '#2C2C2E', '#37474F', '#455A64', '#546E7A', '#78909C'],
    price: 1500,
    emoji: '🌑',
    gradient: ['#37474F', '#1C1C1E'],
    glowColor: 'rgba(84,110,122,0.5)',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    colors: ['#4A148C', '#6A1B9A', '#7B1FA2', '#8E24AA', '#9C27B0', '#CE93D8'],
    price: 3000,
    emoji: '👑',
    gradient: ['#7B1FA2', '#4A148C'],
    glowColor: 'rgba(123,31,162,0.5)',
  },
  {
    id: 'rainbow',
    name: 'Rainbow Elite',
    colors: ['#F44336', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63'],
    price: 8000,
    emoji: '🌈',
    gradient: ['#FF4081', '#7C4DFF'],
    glowColor: 'rgba(124,77,255,0.5)',
  },
];

// Keep BLUE_SHADES / SKIN_COLORS as fallback
export const BLUE_SHADES = SKINS[0].colors;
export const SKIN_COLORS = BLUE_SHADES;
