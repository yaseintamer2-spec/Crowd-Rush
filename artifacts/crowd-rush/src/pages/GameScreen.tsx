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
  addCoins: (amount: number) => void;
  coins: number;
  spendCoins: (amount: number) => boolean;
}

export function GameScreen({ game, onHome, addCoins, coins, spendCoins }: Props) {
  const { state, inputXRef, restart, revive, nextLevel } = game;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 400, height: 700 });
  const [showInterstitial, setShowInterstitial] = useState(false);
  const pendingNextLevel = useRef(false);
  const coinAddedRef = useRef(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

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

  // Award persistent coins when level ends
  useEffect(() => {
    if ((state.phase === 'levelComplete' || state.phase === 'gameOver') && !coinAddedRef.current) {
      coinAddedRef.current = true;
      const earned = state.coinsCollected * 5 + Math.floor(state.crowdSize / 3);
      if (earned > 0) {
        addCoins(earned);
        setCoinsEarned(earned);
      }
    }
    if (state.phase === 'playing') {
      coinAddedRef.current = false;
      setCoinsEarned(0);
    }
  }, [state.phase, state.coinsCollected, state.crowdSize, addCoins]);

  // Show interstitial every 5 levels
  useEffect(() => {
    if (!(state.phase === 'levelComplete' && state.level % 5 === 0)) return;
    const t = setTimeout(() => {
      pendingNextLevel.current = true;
      setShowInterstitial(true);
    }, 1800);
    return () => clearTimeout(t);
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
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#0a0a1a', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GameCanvas
          state={state}
          inputXRef={inputXRef}
          shootingRef={game.shootingRef}
          canvasWidth={dims.width}
          canvasHeight={dims.height}
        />

        {/* Drag hint */}
        {state.phase === 'playing' && state.crowdProgress < 180 && (
          <div style={{
            position: 'absolute', bottom: '24%', left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600,
            fontFamily: 'Inter, sans-serif', background: 'rgba(0,0,0,0.45)',
            padding: '8px 18px', borderRadius: 20, pointerEvents: 'none',
            whiteSpace: 'nowrap', animation: 'fadeOut 2s ease 2s forwards',
          }}>
            ← Drag to steer →
          </div>
        )}

        {/* Live coin counter during game */}
        {state.phase === 'playing' && state.coinsCollected > 0 && (
          <div style={{
            position: 'absolute', top: 74, right: 14,
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '5px 10px',
            border: '1px solid rgba(255,215,0,0.2)', pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 13 }}>💰</span>
            <span style={{ color: '#FFD700', fontWeight: 800, fontSize: 13 }}>{state.coinsCollected}</span>
          </div>
        )}

        {state.phase === 'levelComplete' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <LevelCompleteScreen
              level={state.level}
              crowdSize={state.crowdSize}
              score={state.score}
              coinsEarned={coinsEarned}
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
              coinsEarned={coinsEarned}
              onRetry={() => restart(state.level)}
              onHome={onHome}
            />
          </div>
        )}

        {state.phase === 'rewardedAd' && (
          <RewardedAd
            onComplete={() => revive()}
            onSkip={() => restart(state.level)}
            coins={coins}
            spendCoins={spendCoins}
          />
        )}

        {showInterstitial && (
          <InterstitialAd onComplete={handleInterstitialComplete} />
        )}

        {state.showCountChange && state.showCountChange.timer > 30 && (
          <div style={{
            position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)',
            fontSize: 30, fontWeight: 900, fontFamily: 'Inter, sans-serif',
            color: state.showCountChange.value >= 0 ? '#76FF03' : '#FF5252',
            textShadow: `0 0 14px ${state.showCountChange.value >= 0 ? '#76FF03' : '#FF5252'}`,
            pointerEvents: 'none', animation: 'floatUp 0.8s ease forwards',
          }}>
            {state.showCountChange.value >= 0
              ? `RECRUIT ${state.showCountChange.value}`
              : `LOSS ${Math.abs(state.showCountChange.value)}`}
          </div>
        )}
      </div>

      <BannerAd />
    </div>
  );
}
