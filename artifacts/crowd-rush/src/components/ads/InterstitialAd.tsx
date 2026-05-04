import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

export function InterstitialAd({ onComplete }: Props) {
  const [countdown, setCountdown] = useState(5);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTimer = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (countdown <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, loaded, onComplete]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.97)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      animation: 'fadeIn 0.3s ease',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Ad label */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Advertisement
      </div>

      {/* Skip button */}
      <button
        onClick={countdown <= 0 ? onComplete : undefined}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: countdown <= 0 ? '#7C3AED' : 'rgba(255,255,255,0.1)',
          border: 'none',
          color: 'white',
          fontSize: 12,
          fontWeight: 700,
          padding: '6px 14px',
          borderRadius: 20,
          cursor: countdown <= 0 ? 'pointer' : 'default',
          fontFamily: 'Inter, sans-serif',
          transition: 'background 0.3s',
        }}
      >
        {countdown > 0 ? `Skip in ${countdown}` : '✕ Skip'}
      </button>

      {!loaded ? (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading ad...</div>
      ) : (
        <>
          {/* Fake ad creative */}
          <div style={{
            width: 280,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
            background: 'linear-gradient(160deg, #1a0533, #0d1b4b)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Ad header */}
            <div style={{
              padding: '28px 24px 20px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #6D28D9, #2563EB)',
            }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>🚀</div>
              <div style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}>
                Level Up Your Game
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 13,
                marginTop: 6,
              }}>
                Discover premium gaming experiences
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {/* Fake game thumbnails */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {['🏆', '⚡', '💎'].map((icon, i) => (
                  <div key={i} style={{
                    flex: 1,
                    aspectRatio: '1',
                    borderRadius: 12,
                    background: `hsl(${200 + i * 40}, 60%, 25%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {icon}
                  </div>
                ))}
              </div>

              <button style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(90deg, #7C3AED, #2563EB)',
                color: 'white',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
              }}>
                DOWNLOAD FREE
              </button>

              <div style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontSize: 10,
                marginTop: 10,
              }}>
                4.8★ · 10M+ Downloads
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
