import { useRef, useEffect, useState } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { BannerAd } from '../components/ads/BannerAd';
import { InterstitialAd } from '../components/ads/InterstitialAd';
import { RewardedAd } from '../components/ads/RewardedAd';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { GameOverScreen } from './GameOverScreen';
import { GAME_CONFIG } from '../game/config';
import { LEVELS } from '../game/levels';
import type { GameControls } from '../hooks/useGame';

interface Props {
  game: GameControls;
  onHome: () => void;
}

export function GameScreen({ game, onHome }: Props) {
  const { state, inputXRef, restart, revive, nextLevel } = game;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 400, height: 700 });
  const [showInterstitial, setShowInterstitial] = useState(false);
  const pendingNextLevel = useRef(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ width: Math.floor(r.width), height: Math.floor(r.height - GAME_CONFIG.BANNER_HEIGHT) });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Show interstitial ad between levels 2 and 4
  useEffect(() => {
    if (state.phase === 'levelComplete' && (state.level === 2 || state.level === 4)) {
      const t = setTimeout(() => {
        pendingNextLevel.current = true;
        setShowInterstitial(true);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.level]);

  const handleInterstitialComplete = () => {
    setShowInterstitial(false);
    if (pendingNextLevel.current) {
      pendingNextLevel.current = false;
      nextLevel();
    }
  };

  const isLastLevel = state.level >= LEVELS.length;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a1a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Game canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GameCanvas
          state={state}
          inputXRef={inputXRef}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
        />

        {/* Drag hint on first play */}
        {state.phase === 'playing' && state.crowdProgress < 200 && (
          <div style={{
            position: 'absolute',
            bottom: '22%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.65)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            background: 'rgba(0,0,0,0.4)',
            padding: '8px 18px',
            borderRadius: 20,
            pointerEvents: 'none',
            animation: 'fadeOut 2s ease 1.5s forwards',
            whiteSpace: 'nowrap',
          }}>
            ← Drag to steer →
          </div>
        )}

        {/* Overlays */}
        {state.phase === 'levelComplete' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <LevelCompleteScreen
              level={state.level}
              crowdSize={state.crowdSize}
              score={state.score}
              onNext={() => {
                if (state.level === 2 || state.level === 4) {
                  pendingNextLevel.current = true;
                  setShowInterstitial(true);
                } else {
                  nextLevel();
                }
              }}
              onHome={onHome}
              isLastLevel={isLastLevel}
            />
          </div>
        )}

        {state.phase === 'gameOver' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <GameOverScreen
              level={state.level}
              crowdSize={state.crowdSize}
              score={state.score}
              onRetry={() => restart(state.level)}
              onHome={onHome}
            />
          </div>
        )}

        {state.phase === 'rewardedAd' && (
          <RewardedAd
            onComplete={() => revive()}
            onSkip={() => {
              game.state.usedRevive = true;
              restart(state.level);
            }}
          />
        )}

        {showInterstitial && (
          <InterstitialAd onComplete={handleInterstitialComplete} />
        )}

        {/* Count change floating text */}
        {state.showCountChange && state.showCountChange.timer > 30 && (
          <div style={{
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 28,
            fontWeight: 900,
            fontFamily: 'Inter, sans-serif',
            color: state.showCountChange.value >= 0 ? '#76FF03' : '#FF5252',
            textShadow: `0 0 12px ${state.showCountChange.value >= 0 ? '#76FF03' : '#FF5252'}`,
            pointerEvents: 'none',
            animation: 'floatUp 0.8s ease forwards',
          }}>
            {state.showCountChange.value >= 0 ? '+' : ''}{state.showCountChange.value}
          </div>
        )}
      </div>

      {/* Banner Ad - always at bottom, shifts game up */}
      <BannerAd />
    </div>
  );
}
