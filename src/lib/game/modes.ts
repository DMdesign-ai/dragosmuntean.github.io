export type GameMode = 'road' | 'trail';

export interface ModeConfig {
  id: GameMode;
  label: string;
  description: string;
  obstacleTypes: string[];
  laneLineColor: string;
  laneLineBrightColor: string;
  playerAccentColor: string;
}

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  road: {
    id: 'road',
    label: 'ROAD RUNNER',
    description: 'DODGE TRAFFIC ON CITY STREETS',
    obstacleTypes: ['car', 'cone', 'manhole'],
    laneLineColor: '#2a2a2a',
    laneLineBrightColor: '#4a4a4a',
    playerAccentColor: '#ffd700',
  },
  trail: {
    id: 'trail',
    label: 'TRAIL RUNNER',
    description: 'SURVIVE THE WILD WILDERNESS',
    obstacleTypes: ['bear', 'log', 'bush'],
    laneLineColor: '#3a2a1a',
    laneLineBrightColor: '#5a4a2a',
    playerAccentColor: '#8B6914',
  },
};
