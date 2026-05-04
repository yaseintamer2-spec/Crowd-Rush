import { useRef, useEffect, useState } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { BannerAd } from '../components/ads/BannerAd';
import { InterstitialAd } from '../components/ads/InterstitialAd';
import { RewardedAd } from '../components/ads/RewardedAd';
import { LevelCompleteScreen } from './LevelCompleteScreen';
import { GameOverScreen } from './GameOverScreen';
import { GAME_CONFIG } from '../game/config';
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
        setDims({
          width: Math.floor(r.width),
          height: Math.floor(r.height - GAME_CONFIG.BANNER_HEIGHT),
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Show interstitial every 5 levels
  useEffect(() => {
    if (state.phase === 'levelComplete' && state.level % 5 === 0) {
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

  const handleNext = () => {
    if (state.level % 5 === 0) {
      pendingNextLevel.current = true;
      setShowInterstitial(true);
    } else {
      nextLevel();
    }
  };

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

        {/* Drag hint */}
        {state.phase === 'playing' && state.crowdProgress < 180 && (
          <div style={{
            position: 'absolute',
            bottom: '24%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            background: 'rgba(0,0,0,0.45)',
            padding: '8px 18px',
            borderRadius: 20,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            animation: 'fadeOut 2s ease 2s forwards',
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
              onNext={handleNext}
              onHome={onHome}
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
            onSkip={() => restart(state.level)}
          />
        )}

        {showInterstitial && (
          <InterstitialAd onComplete={handleInterstitialComplete} />
        )}

        {/* Floating count change */}
        {state.showCountChange && state.showCountChange.timer > 30 && (
          <div style={{
            position: 'absolute',
            top: '60%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 30,
            fontWeight: 900,
            fontFamily: 'Inter, sans-serif',
            color: state.showCountChange.value >= 0 ? '#76FF03' : '#FF5252',
            textShadow: `0 0 14px ${state.showCountChange.value >= 0 ? '#76FF03' : '#FF5252'}`,
            pointerEvents: 'none',
            animation: 'floatUp 0.8s ease forwards',
          }}>
            {state.showCountChange.value >= 0 ? '+' : ''}{state.showCountChange.value}
          </div>
        )}
      </div>

      {/* Banner Ad — always at bottom, shifts game up */}
      <BannerAd />
    </div>
  );
}
