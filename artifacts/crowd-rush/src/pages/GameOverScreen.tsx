interface Props {
  level: number;
  crowdSize: number;
  score: number;
  coinsEarned: number;
  onRetry: () => void;
  onHome: () => void;
}

export function GameOverScreen({ level, crowdSize, score, coinsEarned, onRetry, onHome }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #1a0000, #2a0a00)',
    }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,0,0,${0.04 + i * 0.01}), transparent)`,
          width: 120 + i * 80, height: 120 + i * 80,
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          animation: `expandRing ${2 + i * 0.4}s ease-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}

      <div style={{
        position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 0, paddingBottom: 60,
      }}>
        <div style={{
          fontSize: 72, marginBottom: 8, animation: 'shake 0.5s ease 0.2s',
          filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.5))',
        }}>
          💀
        </div>

        <div style={{
          fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: '#FF5252', marginBottom: 4, fontWeight: 700,
        }}>
          Oh No!
        </div>

        <div style={{
          fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #FF5252, #FF1744)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 22,
        }}>
          GAME OVER
        </div>

        {/* Coins earned */}
        {coinsEarned > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: 20, padding: '7px 18px', marginBottom: 18,
          }}>
            <span style={{ fontSize: 16 }}>💰</span>
            <span style={{ color: '#FFD700', fontWeight: 800, fontSize: 14 }}>+{coinsEarned} coins saved</span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[
            { icon: '👥', value: crowdSize, label: 'Crowd Left', color: '#FF8A80' },
            { icon: '💎', value: score, label: 'Score', color: '#FFD700' },
            { icon: '🎮', value: level, label: 'Level', color: '#90CAF9' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,82,82,0.2)',
              borderRadius: 16, padding: '14px 20px', textAlign: 'center', minWidth: 88,
            }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 22, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onRetry}
          style={{
            padding: '18px 64px', borderRadius: 50, border: 'none',
            background: 'linear-gradient(90deg, #FF5252, #FF1744)', color: 'white',
            fontSize: 20, fontWeight: 900, cursor: 'pointer',
            boxShadow: '0 8px 40px rgba(255,82,82,0.5)',
            marginBottom: 16, letterSpacing: '0.04em', fontFamily: 'Inter, sans-serif',
          }}
        >
          TRY AGAIN
        </button>

        <button
          onClick={onHome}
          style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600,
            padding: '12px 40px', borderRadius: 50, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          Home
        </button>

        <div style={{
          marginTop: 24, background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
          padding: '12px 20px', maxWidth: 240, textAlign: 'center',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.7 }}>
            💡 Tip: Always pick <strong style={{ color: 'rgba(255,255,255,0.7)' }}>multiplication gates</strong> — they grow your crowd faster!
          </div>
        </div>
      </div>
    </div>
  );
}
