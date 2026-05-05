import { useRef, useEffect, useCallback } from 'react';
import type { GameState } from '../game/types';
import { renderGame, renderHUD } from '../game/renderer';
import { GAME_CONFIG } from '../game/config';
import { generateLevel, getLevelMeta } from '../game/levels';

interface Props {
  state: GameState;
  inputXRef: React.MutableRefObject<number | null>;
  shootingRef: React.MutableRefObject<boolean>;
  canvasWidth: number;
  canvasHeight: number;
}

export function GameCanvas({ state, inputXRef, shootingRef, canvasWidth, canvasHeight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const handlePointerMove = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pathLeft = (canvasWidth - GAME_CONFIG.PATH_WIDTH) / 2;
    const rect = canvas.getBoundingClientRect();
    const relX = (clientX - rect.left - pathLeft) / GAME_CONFIG.PATH_WIDTH;
    inputXRef.current = Math.max(0.05, Math.min(0.95, relX));
  }, [canvasWidth, inputXRef]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX);
  }, [handlePointerMove]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX);
  }, [handlePointerMove]);

  const onMouseDown = useCallback(() => {
    shootingRef.current = true;
  }, [shootingRef]);

  const onMouseUp = useCallback(() => {
    shootingRef.current = false;
  }, [shootingRef]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    shootingRef.current = true;
    if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX);
  }, [handlePointerMove, shootingRef]);

  const onTouchEnd = useCallback(() => {
    shootingRef.current = false;
  }, [shootingRef]);

  const onMouseLeave = useCallback(() => {
    shootingRef.current = false;
  }, [shootingRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameHeight = canvasHeight - GAME_CONFIG.HUD_HEIGHT - GAME_CONFIG.BANNER_HEIGHT;
    const levelDef = generateLevel(state.level);
    const meta = getLevelMeta(state.level);

    const draw = (ts: number) => {
      timeRef.current = ts / 1000;
      const latest = stateRef.current;
      renderGame(ctx, latest, canvasWidth, canvasHeight, gameHeight, timeRef.current);
      renderHUD(ctx, latest, canvasWidth, meta.twistLabel || `Level ${latest.level}`, levelDef.length);
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [canvasWidth, canvasHeight, state.level]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      style={{ display: 'block', touchAction: 'none', cursor: 'none', userSelect: 'none' }}
    />
  );
}
