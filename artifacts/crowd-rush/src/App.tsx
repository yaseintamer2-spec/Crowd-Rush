import { useState, useCallback, useEffect } from 'react';
import { HomeScreen } from './pages/HomeScreen';
import { GameScreen } from './pages/GameScreen';
import { ShopScreen } from './pages/ShopScreen';
import { LoadingScreen } from './pages/LoadingScreen';
import { useGame } from './hooks/useGame';
import { useCoins } from './hooks/useCoins';
import { GAME_CONFIG } from './game/config';

type Screen = 'loading' | 'home' | 'game' | 'shop';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [gameDims, setGameDims] = useState({ width: 400, height: 700 });
  const coinState = useCoins();

  useEffect(() => {
    const update = () => setGameDims({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const game = useGame(
    gameDims.width,
    gameDims.height - GAME_CONFIG.BANNER_HEIGHT,
    coinState.activeSkin
  );

  const handleLoadComplete = useCallback(() => setScreen('home'), []);
  const handlePlay = useCallback(() => { game.restart(1); setScreen('game'); }, [game]);
  const handleHome = useCallback(() => setScreen('home'), []);
  const handleShop = useCallback(() => setScreen('shop'), []);
  const handleShopBack = useCallback(() => setScreen('home'), []);

  return (
    <div style={{
      width: '100vw', height: '100dvh', overflow: 'hidden',
      background: '#060614', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, height: '100%',
        position: 'relative', overflow: 'hidden',
      }}>
        {screen === 'loading' && (
          <LoadingScreen onComplete={handleLoadComplete} />
        )}
        {screen === 'home' && (
          <HomeScreen
            onPlay={handlePlay}
            onShop={handleShop}
            bestScore={game.bestScore}
            bestCrowd={game.bestCrowd}
            coins={coinState.coins}
            activeSkin={coinState.activeSkin}
          />
        )}
        {screen === 'shop' && (
          <ShopScreen onBack={handleShopBack} {...coinState} />
        )}
        {screen === 'game' && (
          <GameScreen
            game={game}
            onHome={handleHome}
            addCoins={coinState.addCoins}
            coins={coinState.coins}
            spendCoins={coinState.spendCoins}
          />
        )}
      </div>
    </div>
  );
}
