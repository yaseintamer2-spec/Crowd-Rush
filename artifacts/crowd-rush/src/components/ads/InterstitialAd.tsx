import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

export function InterstitialAd({ onComplete }: Props) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(9,10,18,0.96)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <div style={{
          height: 240, borderRadius: 18, border: '2px dashed rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, letterSpacing: '0.08em', marginBottom: 18,
        }}>
          INTERSTITIAL AD SLOT
        </div>
        <button
          onClick={countdown <= 0 ? onComplete : undefined}
          style={{
            width: '100%', padding: '15px', borderRadius: 14,
            border: 'none', background: countdown <= 0 ? '#3f8cff' : '#2b3040',
            color: 'white', fontSize: 15, fontWeight: 900,
            cursor: countdown <= 0 ? 'pointer' : 'default',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {countdown > 0 ? `CONTINUE IN ${countdown}` : 'CONTINUE'}
        </button>
      </div>
    </div>
  );
}
