interface Props {
  level: number;
  crowdSize: number;
  score: number;
  onRetry: () => void;
  onHome: () => void;
}

export function GameOverScreen({ level, crowdSize, score, onRetry, onHome }: Props) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #1a0000, #2a0a00)',
    }}>
      {/* Animated bg circles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,0,0,${0.04 + i * 0.01}), transparent)`,
          width: 120 + i * 80,
          height: 120 + i * 80,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `expandRing ${2 + i * 0.4}s ease-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        paddingBottom: 60,
      }}>
        {/* Emoji */}
        <div style={{
          fontSize: 72,
          marginBottom: 8,
          animation: 'shake 0.5s ease 0.2s',
          filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.5))',
        }}>
          💀
        </div>

        <div style={{
          fontSize: 12,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#FF5252',
          marginBottom: 4,
          fontWeight: 700,
        }}>
          Oh No!
        </div>

        <div style={{
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #FF5252, #FF1744)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 28,
        }}>
          GAME OVER
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 36,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,82,82,0.2)',
            borderRadius: 16,
            padding: '14px 20px',
            textAlign: 'center',
            minWidth: 90,
          }}>
            <div style={{ fontSize: 22 }}>👥</div>
            <div style={{ color: '#FF8A80', fontSize: 22, fontWeight: 900 }}>{crowdSize}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crowd Left</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,82,82,0.2)',
            borderRadius: 16,
            padding: '14px 20px',
            textAlign: 'center',
            minWidth: 90,
          }}>
            <div style={{ fontSize: 22 }}>💎</div>
            <div style={{ color: '#FFD700', fontSize: 22, fontWeight: 900 }}>{score}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,82,82,0.2)',
            borderRadius: 16,
            padding: '14px 20px',
            textAlign: 'center',
            minWidth: 90,
          }}>
            <div style={{ fontSize: 22 }}>🎮</div>
            <div style={{ color: '#90CAF9', fontSize: 22, fontWeight: 900 }}>{level}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</div>
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={onRetry}
          style={{
            padding: '18px 64px',
            borderRadius: 50,
            border: 'none',
            background: 'linear-gradient(90deg, #FF5252, #FF1744)',
            color: 'white',
            fontSize: 20,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 8px 40px rgba(255, 82, 82, 0.5)',
            marginBottom: 16,
            letterSpacing: '0.04em',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          TRY AGAIN
        </button>

        <button
          onClick={onHome}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 14,
            fontWeight: 600,
            padding: '12px 40px',
            borderRadius: 50,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Home
        </button>

        {/* Tip */}
        <div style={{
          marginTop: 28,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '12px 20px',
          maxWidth: 240,
          textAlign: 'center',
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 11,
            lineHeight: 1.7,
          }}>
            💡 Tip: Always pick <strong style={{ color: 'rgba(255,255,255,0.7)' }}>multiplication gates</strong> over addition — they grow your crowd faster!
          </div>
        </div>
      </div>
    </div>
  );
}
