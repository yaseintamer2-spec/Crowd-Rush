import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export function RewardedAd({ onComplete, onSkip }: Props) {
  const [phase, setPhase] = useState<'watching' | 'done'>('watching');
  const [progress, setProgress] = useState(0);
  const DURATION = 8;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const p = Math.min(1, elapsed / DURATION);
      setProgress(p);
      if (p >= 1) {
        clearInterval(interval);
        setPhase('done');
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const circumference = 2 * Math.PI * 28;
  const dash = circumference * (1 - progress);

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
      fontFamily: 'Inter, sans-serif',
      padding: 24,
      gap: 0,
    }}>
      {phase === 'watching' ? (
        <>
          {/* Reward preview */}
          <div style={{
            textAlign: 'center',
            marginBottom: 28,
          }}>
            <div style={{ fontSize: 60, marginBottom: 8 }}>💫</div>
            <div style={{
              color: '#76FF03',
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}>
              Watch to Revive!
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              marginTop: 8,
            }}>
              Your crowd will return with 8 members
            </div>
          </div>

          {/* Fake ad creative */}
          <div style={{
            width: '100%',
            maxWidth: 280,
            borderRadius: 16,
            overflow: 'hidden',
            background: 'linear-gradient(160deg, #0f2027, #203a43, #2c5364)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 28,
          }}>
            <div style={{
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              fontSize: 64,
            }}>
              🎯
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                Epic Puzzle Challenge
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 11,
                marginBottom: 12,
              }}>
                Play 5000+ levels. Free!
              </div>
              <div style={{
                background: '#F59E0B',
                color: 'white',
                textAlign: 'center',
                padding: '8px',
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 12,
              }}>
                GET IT FREE
              </div>
            </div>
          </div>

          {/* Timer ring */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={72} height={72}>
              <circle
                cx={36} cy={36} r={28}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={5}
              />
              <circle
                cx={36} cy={36} r={28}
                fill="none"
                stroke="#76FF03"
                strokeWidth={5}
                strokeDasharray={circumference}
                strokeDashoffset={dash}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: 'stroke-dashoffset 0.05s linear', filter: 'drop-shadow(0 0 6px #76FF03)' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              color: 'white',
              fontWeight: 700,
              fontSize: 15,
            }}>
              {Math.ceil(DURATION * (1 - progress))}s
            </div>
          </div>

          <div style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 11,
            marginTop: 12,
          }}>
            Must watch full ad to claim reward
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
          <div style={{
            color: '#76FF03',
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Reward Earned!
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 15,
            marginBottom: 36,
          }}>
            Your crowd is back! Keep going!
          </div>
          <button
            onClick={onComplete}
            style={{
              padding: '16px 48px',
              borderRadius: 50,
              border: 'none',
              background: 'linear-gradient(90deg, #76FF03, #00E676)',
              color: '#0a0a0a',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(118, 255, 3, 0.5)',
              letterSpacing: '0.02em',
              transform: 'scale(1)',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            CONTINUE!
          </button>
          <div
            style={{
              marginTop: 20,
              color: 'rgba(255,255,255,0.3)',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
            onClick={onSkip}
          >
            No thanks, give up
          </div>
        </div>
      )}
    </div>
  );
}
