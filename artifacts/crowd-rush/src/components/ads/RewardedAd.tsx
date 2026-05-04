import { useEffect, useState } from 'react';
import { GAME_CONFIG } from '../../game/config';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
  coins: number;
  spendCoins: (amount: number) => boolean;
}

export function RewardedAd({ onComplete, onSkip, coins, spendCoins }: Props) {
  const [mode, setMode] = useState<'choice' | 'watching' | 'done'>('choice');
  const [progress, setProgress] = useState(0);
  const DURATION = 8;
  const canAfford = coins >= GAME_CONFIG.REVIVE_COIN_COST;

  useEffect(() => {
    if (mode !== 'watching') return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const p = Math.min(1, elapsed / DURATION);
      setProgress(p);
      if (p >= 1) { clearInterval(interval); setMode('done'); }
    }, 50);
    return () => clearInterval(interval);
  }, [mode]);

  function handleCoinRevive() {
    if (spendCoins(GAME_CONFIG.REVIVE_COIN_COST)) {
      setMode('done');
    }
  }

  const circumference = 2 * Math.PI * 28;
  const dash = circumference * (1 - progress);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Inter, sans-serif', padding: 24, gap: 0,
    }}>
      {mode === 'choice' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 320, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>😵</div>
          <div style={{ color: 'white', fontSize: 22, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.02em' }}>
            Your Crowd Fell!
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 28 }}>
            Revive with 8 members and keep going
          </div>

          {/* Coin revive */}
          <button
            onClick={handleCoinRevive}
            disabled={!canAfford}
            style={{
              width: '100%', padding: '16px', borderRadius: 16, marginBottom: 12,
              border: canAfford ? '1.5px solid rgba(255,215,0,0.35)' : '1.5px solid rgba(255,255,255,0.08)',
              background: canAfford
                ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(245,124,0,0.15))'
                : 'rgba(255,255,255,0.04)',
              cursor: canAfford ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: 14,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
              background: canAfford
                ? 'radial-gradient(circle at 35% 35%, #FFF176, #FFD700, #F57F17)'
                : 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              boxShadow: canAfford ? '0 0 16px rgba(255,215,0,0.5)' : 'none',
            }}>
              💰
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{
                color: canAfford ? '#FFD700' : 'rgba(255,255,255,0.3)',
                fontSize: 15, fontWeight: 800,
              }}>
                Use {GAME_CONFIG.REVIVE_COIN_COST} Coins
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                {canAfford
                  ? `You have ${coins} coins`
                  : `Need ${GAME_CONFIG.REVIVE_COIN_COST - coins} more coins`}
              </div>
            </div>
            {canAfford && (
              <div style={{ color: '#FFD700', fontSize: 18, fontWeight: 900 }}>›</div>
            )}
          </button>

          {/* Watch ad */}
          <button
            onClick={() => setMode('watching')}
            style={{
              width: '100%', padding: '16px', borderRadius: 16, marginBottom: 24,
              border: '1.5px solid rgba(118,255,3,0.25)',
              background: 'linear-gradient(135deg, rgba(118,255,3,0.12), rgba(0,230,118,0.12))',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #76FF03, #00E676)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 0 14px rgba(118,255,3,0.45)',
            }}>
              📺
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ color: '#76FF03', fontSize: 15, fontWeight: 800 }}>
                Watch Ad — Free!
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                Watch a short ad to revive
              </div>
            </div>
            <div style={{ color: '#76FF03', fontSize: 18, fontWeight: 900 }}>›</div>
          </button>

          <div
            onClick={onSkip}
            style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Give up and go home
          </div>
        </div>
      )}

      {mode === 'watching' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>💫</div>
            <div style={{ color: '#76FF03', fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>
              Watch to Revive!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 6 }}>
              Your crowd will return with 8 members
            </div>
          </div>

          {/* Fake ad */}
          <div style={{
            width: '100%', maxWidth: 280, borderRadius: 16, overflow: 'hidden',
            background: 'linear-gradient(160deg, #0f2027, #203a43, #2c5364)',
            border: '1px solid rgba(255,255,255,0.1)', marginBottom: 24,
          }}>
            <div style={{
              height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)', fontSize: 60,
            }}>
              🎯
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Epic Puzzle Challenge</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10 }}>Play 5000+ levels. Free!</div>
              <div style={{
                background: '#F59E0B', color: 'white', textAlign: 'center',
                padding: '7px', borderRadius: 8, fontWeight: 800, fontSize: 12,
              }}>
                GET IT FREE
              </div>
            </div>
          </div>

          {/* Timer ring */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <svg width={68} height={68}>
              <circle cx={34} cy={34} r={28} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
              <circle cx={34} cy={34} r={28} fill="none" stroke="#76FF03" strokeWidth={5}
                strokeDasharray={circumference} strokeDashoffset={dash} strokeLinecap="round"
                transform="rotate(-90 34 34)"
                style={{ transition: 'stroke-dashoffset 0.05s linear', filter: 'drop-shadow(0 0 6px #76FF03)' }}
              />
            </svg>
            <div style={{ position: 'absolute', color: 'white', fontWeight: 700, fontSize: 14 }}>
              {Math.ceil(DURATION * (1 - progress))}s
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Must watch full ad to revive</div>
        </>
      )}

      {mode === 'done' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ fontSize: 72, marginBottom: 14 }}>🎉</div>
          <div style={{ color: '#76FF03', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Revive Earned!
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 32 }}>
            Your crowd is back! Keep going!
          </div>
          <button
            onClick={onComplete}
            style={{
              padding: '15px 48px', borderRadius: 50, border: 'none',
              background: 'linear-gradient(90deg, #76FF03, #00E676)', color: '#0a0a0a',
              fontSize: 17, fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(118,255,3,0.5)', letterSpacing: '0.03em',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            CONTINUE!
          </button>
        </div>
      )}
    </div>
  );
}
