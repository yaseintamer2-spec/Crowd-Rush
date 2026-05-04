import { useRef, useEffect, useCallback } from 'react';
import type { GameState } from '../game/types';
import { renderGame, renderHUD } from '../game/renderer';
import { GAME_CONFIG } from '../game/config';
import { LEVELS } from '../game/levels';

interface Props {
  state: GameState;
  inputXRef: React.MutableRefObject<number | null>;
  canvasWidth: number;
  canvasHeight: number;
}

export function GameCanvas({ state, inputXRef, canvasWidth, canvasHeight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const handlePointerMove = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { pathLeft } = {
      pathLeft: (canvasWidth - GAME_CONFIG.PATH_WIDTH) / 2,
    };
    const relX = (clientX - rect.left - pathLeft) / GAME_CONFIG.PATH_WIDTH;
    inputXRef.current = Math.max(0.05, Math.min(0.95, relX));
  }, [canvasWidth, inputXRef]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX);
  }, [handlePointerMove]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX);
    }
  }, [handlePointerMove]);

  const onMouseLeave = useCallback(() => {
    // keep last position when leaving
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameHeight = canvasHeight - GAME_CONFIG.HUD_HEIGHT - GAME_CONFIG.BANNER_HEIGHT;
    const levelDef = LEVELS[Math.min(state.level - 1, LEVELS.length - 1)];

    const draw = (ts: number) => {
      timeRef.current = ts / 1000;
      renderGame(ctx, state, canvasWidth, canvasHeight, gameHeight, timeRef.current);
      renderHUD(ctx, state, canvasWidth, levelDef.label, levelDef.length);
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, canvasWidth, canvasHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'block',
        touchAction: 'none',
        cursor: 'none',
        userSelect: 'none',
      }}
    />
  );
}
