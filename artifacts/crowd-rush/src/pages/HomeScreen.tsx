import { useEffect, useRef } from 'react';

interface Props {
  onPlay: () => void;
  bestScore: number;
  bestCrowd: number;
}

function BlueFigure({ x, delay, size = 1 }: { x: number; delay: number; size?: number }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: `${x}%`,
      animation: `figureWalk 3s ${delay}s ease-in-out infinite`,
      opacity: 0,
    }}>
      <svg width={28 * size} height={52 * size} viewBox="0 0 28 52" fill="none">
        {/* Shadow */}
        <ellipse cx="14" cy="50" rx="8" ry="2.5" fill="rgba(0,0,0,0.3)" />
        {/* Left leg */}
        <rect x="9" y="32" width="5" height="14" rx="2.5" fill="#1565C0" style={{ transformOrigin: '11.5px 32px', animation: `legL 0.5s ${delay}s ease-in-out infinite` }} />
        {/* Right leg */}
        <rect x="14" y="32" width="5" height="14" rx="2.5" fill="#1565C0" style={{ transformOrigin: '16.5px 32px', animation: `legR 0.5s ${delay}s ease-in-out infinite` }} />
        {/* Body */}
        <rect x="7" y="16" width="14" height="18" rx="5" fill="#1976D2" />
        {/* Left arm */}
        <rect x="1" y="18" width="5" height="11" rx="2.5" fill="#1565C0" style={{ transformOrigin: '3.5px 18px', animation: `armL 0.5s ${delay}s ease-in-out infinite` }} />
        {/* Right arm */}
        <rect x="22" y="18" width="5" height="11" rx="2.5" fill="#1565C0" style={{ transformOrigin: '24.5px 18px', animation: `armR 0.5s ${delay}s ease-in-out infinite` }} />
        {/* Head */}
        <circle cx="14" cy="10" r="8" fill="#2196F3" />
        {/* Head highlight */}
        <circle cx="11" cy="7" r="3" fill="rgba(144,202,249,0.3)" />
      </svg>
    </div>
  );
}

export function HomeScreen({ onPlay, bestScore, bestCrowd }: Props) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: 'linear-gradient(165deg, #060614 0%, #0a0028 50%, #060614 100%)',
    }}>

      {/* Ambient blobs */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(33,150,243,0.12) 0%, transparent 70%)',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(118,255,3,0.07) 0%, transparent 70%)',
        bottom: '20%',
        left: '20%',
        pointerEvents: 'none',
        animation: 'ambientFloat 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        top: '30%',
        right: '10%',
        pointerEvents: 'none',
        animation: 'ambientFloat 8s ease-in-out infinite reverse',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Blue figures walking */}
      <BlueFigure x={8} delay={0} size={0.85} />
      <BlueFigure x={18} delay={0.3} size={1.1} />
      <BlueFigure x={30} delay={0.6} size={0.9} />
      <BlueFigure x={60} delay={0.2} size={1.0} />
      <BlueFigure x={72} delay={0.5} size={0.85} />
      <BlueFigure x={82} delay={0.15} size={1.05} />

      {/* Ground line */}
      <div style={{
        position: 'absolute',
        bottom: 76,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(33,150,243,0.3), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 80,
        gap: 0,
      }}>

        {/* Icon */}
        <div style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 8px 40px rgba(21,101,192,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
          animation: 'iconFloat 4s ease-in-out infinite',
        }}>
          <svg width={52} height={52} viewBox="0 0 52 52" fill="none">
            {/* Multiple figures icon */}
            <circle cx="26" cy="11" r="7" fill="#42A5F5" />
            <rect x="19" y="20" width="14" height="20" rx="5" fill="#2196F3" />
            <circle cx="10" cy="14" r="5.5" fill="#1976D2" />
            <rect x="4" y="22" width="11" height="16" rx="4" fill="#1565C0" />
            <circle cx="42" cy="14" r="5.5" fill="#1976D2" />
            <rect x="37" y="22" width="11" height="16" rx="4" fill="#1565C0" />
          </svg>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
          textAlign: 'center',
          marginBottom: 6,
          background: 'linear-gradient(170deg, #ffffff 20%, #90CAF9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          CROWD
        </div>
        <div style={{
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
          textAlign: 'center',
          marginBottom: 10,
          background: 'linear-gradient(170deg, #76FF03 20%, #00C853 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(118,255,3,0.35))',
        }}>
          RUSH
        </div>

        {/* Tagline */}
        <div style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          GROW · SMASH · REPEAT
        </div>

        {/* Stats row */}
        {bestScore > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Best Score', value: bestScore, color: '#FFD700', icon: '🏆' },
              { label: 'Best Crowd', value: bestCrowd, color: '#76FF03', icon: '👥' },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '10px 18px',
                textAlign: 'center',
                minWidth: 100,
              }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ color: s.color, fontSize: 20, fontWeight: 900 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Play button */}
        <button
          onClick={onPlay}
          style={{
            padding: '19px 76px',
            borderRadius: 100,
            border: 'none',
            background: 'linear-gradient(90deg, #2196F3, #1565C0)',
            color: 'white',
            fontSize: 20,
            fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            boxShadow: '0 8px 40px rgba(33,150,243,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
            transition: 'transform 0.12s, box-shadow 0.12s',
            marginBottom: 14,
            animation: 'playPulse 2.5s ease-in-out infinite',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 50px rgba(33,150,243,0.75), 0 0 0 1px rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 40px rgba(33,150,243,0.55), 0 0 0 1px rgba(255,255,255,0.06)';
          }}
        >
          PLAY NOW
        </button>

        <div style={{
          color: 'rgba(255,255,255,0.25)',
          fontSize: 11,
          letterSpacing: '0.06em',
        }}>
          ∞ ENDLESS LEVELS
        </div>

        {/* How to play */}
        <div style={{
          marginTop: 28,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '14px 22px',
          textAlign: 'center',
          maxWidth: 260,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11.5, lineHeight: 2 }}>
            <div>← Drag left &amp; right to steer your crowd →</div>
            <div style={{ color: '#76FF03', fontWeight: 700 }}>Pick the best gate · Smash the door</div>
            <div style={{ color: '#FFD700' }}>Every 10 levels: special twist!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
