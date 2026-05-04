import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const TIPS = [
  'Always pick multiplication gates — they grow fastest!',
  'Steer early — the crowd takes a moment to follow.',
  'Every 10 levels brings a surprise twist!',
  'Coins give you 100 score each — collect them all.',
  'Watch an ad to revive your crowd if they fall.',
  'The bigger your crowd, the easier to smash the door.',
];

export function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [phase, setPhase] = useState<'logo' | 'loading'>('logo');

  useEffect(() => {
    const t = setTimeout(() => setPhase('loading'), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;
    const start = Date.now();
    const duration = 2200;
    const iv = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / duration);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - p, 2.5);
      setProgress(eased);
      if (p >= 1) {
        clearInterval(iv);
        setTimeout(onComplete, 200);
      }
    }, 30);
    return () => clearInterval(iv);
  }, [phase, onComplete]);

  useEffect(() => {
    const iv = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 2500);
    return () => clearInterval(iv);
  }, []);

  const pct = Math.round(progress * 100);
  const barW = progress * 100;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(165deg, #020210 0%, #060620 50%, #010114 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      zIndex: 1000,
    }}>

      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(33,150,243,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(33,150,243,0.04) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(33,150,243,0.18) 0%, transparent 65%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        animation: 'glowPulse 3s ease-in-out infinite',
      }} />

      {/* Ambient rings */}
      {[180, 260, 340].map((size, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1px solid rgba(33,150,243,${0.12 - i * 0.03})`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `ringExpand ${3 + i}s ease-out infinite`,
          animationDelay: `${i * 0.8}s`,
        }} />
      ))}

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}>

        {/* App icon */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 28,
          background: 'linear-gradient(145deg, #1565C0, #0D47A1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(21,101,192,0.7)',
          animation: phase === 'logo' ? 'iconBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'iconFloat 4s ease-in-out infinite',
        }}>
          <svg width={62} height={62} viewBox="0 0 62 62" fill="none">
            {/* Center figure */}
            <circle cx="31" cy="13" r="8.5" fill="#42A5F5" />
            <rect x="23" y="23" width="16" height="22" rx="6" fill="#2196F3" />
            {/* Left figure */}
            <circle cx="12" cy="17" r="6.5" fill="#1976D2" />
            <rect x="5" y="26" width="13" height="17" rx="5" fill="#1565C0" />
            {/* Right figure */}
            <circle cx="50" cy="17" r="6.5" fill="#1976D2" />
            <rect x="44" y="26" width="13" height="17" rx="5" fill="#1565C0" />
            {/* Running legs hint */}
            <rect x="26" y="44" width="5.5" height="13" rx="2.5" fill="#1976D2" />
            <rect x="30.5" y="44" width="5.5" height="13" rx="2.5" fill="#1976D2" />
          </svg>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          textAlign: 'center',
          marginBottom: 4,
          background: 'linear-gradient(170deg, #ffffff 30%, #90CAF9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: phase === 'logo' ? 'slideInUp 0.5s ease 0.2s both' : 'none',
        }}>
          CROWD
        </div>
        <div style={{
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          textAlign: 'center',
          marginBottom: 36,
          background: 'linear-gradient(170deg, #76FF03 30%, #00C853)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 16px rgba(118,255,3,0.4))',
          animation: phase === 'logo' ? 'slideInUp 0.5s ease 0.3s both' : 'none',
        }}>
          RUSH
        </div>

        {/* Progress bar */}
        <div style={{
          width: 220,
          marginBottom: 14,
          animation: phase === 'logo' ? 'slideInUp 0.5s ease 0.5s both' : 'none',
        }}>
          {/* Bar track */}
          <div style={{
            width: '100%',
            height: 5,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.07)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              height: '100%',
              width: `${barW}%`,
              borderRadius: 4,
              background: 'linear-gradient(90deg, #1976D2, #42A5F5)',
              boxShadow: '0 0 10px rgba(33,150,243,0.8)',
              transition: 'width 0.06s linear',
              position: 'relative',
            }}>
              {/* Shimmer */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                animation: 'shimmer 1.2s ease-in-out infinite',
              }} />
            </div>
          </div>

          {/* Percentage */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
            <div style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              Loading...
            </div>
            <div style={{
              color: '#42A5F5',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}>
              {pct}%
            </div>
          </div>
        </div>

        {/* Tip */}
        <div style={{
          width: 260,
          textAlign: 'center',
          padding: '12px 16px',
          background: 'rgba(33,150,243,0.06)',
          border: '1px solid rgba(33,150,243,0.12)',
          borderRadius: 12,
          animation: phase === 'logo' ? 'slideInUp 0.5s ease 0.6s both' : 'none',
          minHeight: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
            lineHeight: 1.6,
            animation: 'tipFade 0.4s ease',
            key: tipIdx,
          }}>
            <span style={{ color: '#90CAF9', fontWeight: 700 }}>💡 Tip: </span>
            {TIPS[tipIdx]}
          </div>
        </div>

        {/* Version / studio label */}
        <div style={{
          marginTop: 32,
          color: 'rgba(255,255,255,0.18)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          v1.0 · Crowd Rush Studio
        </div>
      </div>
    </div>
  );
}
