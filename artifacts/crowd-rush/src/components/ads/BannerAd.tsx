export function BannerAd() {
  return (
    <div
      style={{
        width: '100%',
        height: `60px`,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ad shimmer background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
        animation: 'shimmer 2.5s infinite',
      }} />

      {/* Ad label */}
      <div style={{
        position: 'absolute',
        top: 4,
        left: 8,
        fontSize: 9,
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontFamily: 'Inter, sans-serif',
      }}>
        Advertisement
      </div>

      {/* Fake ad content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}>
          🎮
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
          }}>
            Play More Games
          </div>
          <div style={{
            color: '#90CAF9',
            fontSize: 10,
            fontFamily: 'Inter, sans-serif',
          }}>
            Tap to discover new adventures
          </div>
        </div>
        <div style={{
          background: '#7C3AED',
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 12,
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.03em',
          cursor: 'pointer',
        }}>
          PLAY
        </div>
      </div>
    </div>
  );
}
