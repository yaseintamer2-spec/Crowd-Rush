import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameState } from '../game/types';
import { initLevel, updateGame } from '../game/engine';
import { LEVELS } from '../game/levels';

export interface GameControls {
  state: GameState;
  inputXRef: React.MutableRefObject<number | null>;
  restart: (level: number) => void;
  revive: () => void;
  nextLevel: () => void;
  bestScore: number;
  bestCrowd: number;
}

export function useGame(
  canvasWidth: number,
  canvasHeight: number
): GameControls {
  const [state, setState] = useState<GameState>(() => ({
    phase: 'home',
    level: 1,
    crowdX: 0.5,
    crowdSize: 10,
    crowdProgress: 0,
    characters: [],
    gates: [],
    obstacles: [],
    particles: [],
    finalDoor: null,
    coins: [],
    score: 0,
    time: 0,
    usedRevive: false,
    showingDoorShake: false,
    showCountChange: null,
  }));

  const stateRef = useRef(state);
  stateRef.current = state;

  const inputXRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [bestScore, setBestScore] = useState(() => {
    try { return parseInt(localStorage.getItem('cr_bestScore') || '0'); } catch { return 0; }
  });
  const [bestCrowd, setBestCrowd] = useState(() => {
    try { return parseInt(localStorage.getItem('cr_bestCrowd') || '0'); } catch { return 0; }
  });

  const restart = useCallback((level: number) => {
    const levelIndex = Math.max(0, Math.min(level - 1, LEVELS.length - 1));
    setState(initLevel(levelIndex));
    inputXRef.current = null;
  }, []);

  const revive = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'playing',
      crowdSize: 8,
      usedRevive: true,
      characters: [],
    }));
  }, []);

  const nextLevel = useCallback(() => {
    setState((prev) => {
      const nextLevelNum = prev.level < LEVELS.length ? prev.level + 1 : 1;
      const newState = initLevel(nextLevelNum - 1);
      return { ...newState, score: prev.score };
    });
  }, []);

  useEffect(() => {
    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = timestamp;

      const current = stateRef.current;
      if (current.phase === 'playing' && canvasWidth > 0 && canvasHeight > 0) {
        const levelDef = LEVELS[Math.min(current.level - 1, LEVELS.length - 1)];
        const next = updateGame(
          current,
          dt,
          inputXRef.current,
          canvasWidth,
          canvasHeight,
          levelDef
        );
        setState(next);
        stateRef.current = next;

        // Persist best
        if (next.phase === 'levelComplete' || next.phase === 'gameOver') {
          if (next.score > bestScore) {
            setBestScore(next.score);
            try { localStorage.setItem('cr_bestScore', String(next.score)); } catch { }
          }
          if (next.crowdSize > bestCrowd) {
            setBestCrowd(next.crowdSize);
            try { localStorage.setItem('cr_bestCrowd', String(next.crowdSize)); } catch { }
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasWidth, canvasHeight, bestScore, bestCrowd]);

  return { state, inputXRef, restart, revive, nextLevel, bestScore, bestCrowd };
}
