export const GAME_CONFIG = {
  PATH_WIDTH: 380,
  CHARACTER_RADIUS: 10,
  CHARACTER_HEAD_RADIUS: 7,
  CROWD_CENTER_Y_RATIO: 0.72,
  HUD_HEIGHT: 70,
  BANNER_HEIGHT: 60,
  GATE_HEIGHT: 100,
  GATE_Y_RANGE: 50,
  OBSTACLE_DAMAGE: 4,
  MAX_VISIBLE_CHARACTERS: 90,
  COIN_RADIUS: 10,
  DOOR_HEIGHT: 80,
} as const;

// Blue silhouette palette — crowd style
export const BLUE_SHADES = [
  '#1565C0',
  '#1976D2',
  '#1E88E5',
  '#2196F3',
  '#0D47A1',
  '#283593',
  '#1A237E',
  '#42A5F5',
  '#1976D2',
  '#1565C0',
];

// Keep SKIN_COLORS as alias for compatibility
export const SKIN_COLORS = BLUE_SHADES;
