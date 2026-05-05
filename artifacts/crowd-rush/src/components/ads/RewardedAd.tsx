import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
  coins: number;
  spendCoins: (amount: number) => boolean;
}

export function RewardedAd({ onComplete, onSkip }: Props) {
  const [mode, setMode] = useState<'choice' | 'watching' | 'done'>('choice');
  const [progress, setProgress] = useState(0);
  const DURATION = 5;

  useEffect(() => {
    if (mode !== 'watching') return;
    const start = Date.now();
    const interval = setInterval(() => {
      const next = Math.min(1, (Date.now() - start) / (DURATION * 1000));
      setProgress(next);
      if (next >= 1) {
        clearInterval(interval);
        setMode('done');
      }
    }, 80);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(9, 10, 18, 0.96)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: 24,
    }}>
      {mode === 'choice' && (
        <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
          <div style={{ fontSize: 46, fontWeight: 900, color: 'white', marginBottom: 8 }}>
            REVIVE?
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5, marginBottom: 26 }}>
            Rewarded ad placeholder. Later this button will call the real ad SDK.
          </div>
          <button
            onClick={() => setMode('watching')}
            style={{
              width: '100%', padding: '17px 18px', borderRadius: 14,
              border: 'none', background: '#76FF03', color: '#081008',
              fontSize: 17, fontWeight: 900, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', marginBottom: 12,
            }}
          >
            WATCH AD TO REVIVE
          </button>
          <button
            onClick={onSkip}
            style={{
              width: '100%', padding: '14px 18px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            GIVE UP
          </button>
        </div>
      )}

      {mode === 'watching' && (
        <div style={{ width: '100%', maxWidth: 330, textAlign: 'center' }}>
          <div style={{
            height: 210, borderRadius: 18, border: '2px dashed rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.05)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.65)',
            fontWeight: 900, letterSpacing: '0.08em', marginBottom: 18,
          }}>
            REWARDED AD SLOT
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: '#76FF03' }} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 10 }}>
            Simulating ad playback for development
          </div>
        </div>
      )}

      {mode === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#76FF03', fontSize: 34, fontWeight: 900, marginBottom: 10 }}>
            REVIVED
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 26 }}>
            Back before the wall with a fresh crowd.
          </div>
          <button
            onClick={onComplete}
            style={{
              padding: '16px 46px', borderRadius: 14, border: 'none',
              background: '#3f8cff', color: 'white', fontSize: 17,
              fontWeight: 900, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            CONTINUE
          </button>
        </div>
      )}
    </div>
  );
}
