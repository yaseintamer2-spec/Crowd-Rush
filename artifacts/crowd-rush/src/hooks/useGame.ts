import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameState } from '../game/types';
import { initLevel, updateGame, buildFormation } from '../game/engine';
import { generateLevel } from '../game/levels';
import { SKINS } from '../game/config';
import { GAME_CONFIG } from '../game/config';

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
  canvasHeight: number,
  skinId = 'blue'
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
    coinsCollected: 0,
    time: 0,
    usedRevive: false,
    showingDoorShake: false,
    showCountChange: null,
    activeSkinId: skinId,
  }));

  const [bestScore, setBestScore] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('cr_best') || '0'); } catch { return 0; }
  });
  const [bestCrowd, setBestCrowd] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('cr_crowd') || '0'); } catch { return 0; }
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const inputXRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const bestScoreRef = useRef(bestScore);
  bestScoreRef.current = bestScore;
  const bestCrowdRef = useRef(bestCrowd);
  bestCrowdRef.current = bestCrowd;
  const skinIdRef = useRef(skinId);
  skinIdRef.current = skinId;

  const restart = useCallback((level: number) => {
    setState(initLevel(Math.max(1, level), skinIdRef.current));
    inputXRef.current = null;
  }, []);

  const revive = useCallback(() => {
    setState((prev) => {
      const skin = SKINS.find((s) => s.id === prev.activeSkinId) ?? SKINS[0];
      return {
        ...prev,
        phase: 'playing',
        crowdSize: 8,
        usedRevive: true,
        characters: buildFormation(8, skin.colors),
      };
    });
  }, []);

  const nextLevel = useCallback(() => {
    setState((prev) => initLevel(prev.level + 1, prev.activeSkinId));
  }, []);

  useEffect(() => {
    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = ts;

      const cur = stateRef.current;
      if (cur.phase === 'playing' && canvasWidth > 0 && canvasHeight > 0) {
        const def = generateLevel(cur.level);
        const next = updateGame(cur, dt, inputXRef.current, canvasWidth, canvasHeight, def);
        setState(next);
        stateRef.current = next;

        if (next.phase === 'levelComplete' || next.phase === 'gameOver') {
          if (next.score > bestScoreRef.current) {
            setBestScore(next.score);
            try { localStorage.setItem('cr_best', String(next.score)); } catch {}
          }
          if (next.crowdSize > bestCrowdRef.current) {
            setBestCrowd(next.crowdSize);
            try { localStorage.setItem('cr_crowd', String(next.crowdSize)); } catch {}
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasWidth, canvasHeight]);

  return { state, inputXRef, restart, revive, nextLevel, bestScore, bestCrowd };
}
