export type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export interface FallingObject {
  id: number;
  x: number;
  y: number;
  speed: number;
  emoji: string;
  type: 'TRASH' | 'GOOD';
  rotation: number;
  rotationSpeed: number;
  size: number;
}

export interface GameStats {
  score: number;
  lives: number;
  timeLeft: number;
}
