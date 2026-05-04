import { useEffect, useRef } from 'react';
import { getLevelMeta } from '../game/levels';

interface Props {
  level: number;
  crowdSize: number;
  score: number;
  coinsEarned: number;
  onNext: () => void;
  onHome: () => void;
}

export function LevelCompleteScreen({ level, crowdSize, score, coinsEarned, onNext, onHome }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const nextMeta = getLevelMeta(level + 1);
  const isTwistNext = nextMeta.twist !== 'none';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const confetti: { x: number; y: number; vx: number; vy: number; color: string; w: number; h: number; rot: number; rotV: number }[] = [];
    const COLS = ['#2196F3','#42A5F5','#76FF03','#FFD700','#FF6B6B','#4ECDC4','#90CAF9','#A5D6A7'];

    for (let i = 0; i < 70; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 1.8 + Math.random() * 2.5,
        color: COLS[Math.floor(Math.random() * COLS.length)],
        w: 7 + Math.random() * 8,
        h: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.15,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#030d1a');
      bg.addColorStop(1, '#050a00');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const c of confetti) {
        c.x += c.vx; c.y += c.vy; c.rot += c.rotV;
        if (c.y > canvas.height + 20) c.y = -20;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const stars = crowdSize >= 60 ? 3 : crowdSize >= 30 ? 2 : 1;

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
    }}>
      <canvas
        ref={canvasRef}
        width={480}
        height={800}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        paddingBottom: 70,
        animation: 'slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Trophy */}
        <div style={{
          fontSize: 72,
          marginBottom: 6,
          filter: 'drop-shadow(0 0 24px rgba(255,215,0,0.8))',
          animation: 'iconBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          🏆
        </div>

        <div style={{
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#76FF03',
          fontWeight: 700,
          marginBottom: 4,
        }}>
          Level {level} Complete!
        </div>

        <div style={{
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #FFD700, #FF9800)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 18,
        }}>
          DOOR SMASHED!
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {[1, 2, 3].map((s) => (
            <span key={s} style={{
              fontSize: 34,
              filter: s <= stars ? 'drop-shadow(0 0 10px rgba(255,215,0,0.9))' : 'none',
              opacity: s <= stars ? 1 : 0.18,
              animation: s <= stars ? `starPop ${0.3 + s * 0.15}s cubic-bezier(0.34, 1.56, 0.64, 1) both` : 'none',
              display: 'inline-block',
            }}>⭐</span>
          ))}
        </div>

        {/* Coins earned banner */}
        {coinsEarned > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: 20, padding: '8px 20px', marginBottom: 16,
            animation: 'fadeIn 0.5s ease 0.3s both',
          }}>
            <span style={{ fontSize: 18 }}>💰</span>
            <span style={{ color: '#FFD700', fontWeight: 900, fontSize: 15 }}>+{coinsEarned} coins earned!</span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {[
            { icon: '👥', value: crowdSize, label: 'Crowd', color: '#42A5F5' },
            { icon: '💎', value: score, label: 'Score', color: '#FFD700' },
            { icon: '🎮', value: level, label: 'Level', color: '#76FF03' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '10px 14px',
              textAlign: 'center',
              minWidth: 78,
            }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Next level teaser */}
        {isTwistNext && (
          <div style={{
            marginBottom: 18,
            background: `${nextMeta.twistColor}18`,
            border: `1px solid ${nextMeta.twistColor}44`,
            borderRadius: 12,
            padding: '8px 20px',
            textAlign: 'center',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Next Level
            </div>
            <div style={{ color: nextMeta.twistColor, fontSize: 14, fontWeight: 900 }}>
              {nextMeta.twistEmoji} {nextMeta.twistLabel}
            </div>
          </div>
        )}

        {/* Next button */}
        <button
          onClick={onNext}
          style={{
            padding: '17px 60px',
            borderRadius: 100,
            border: 'none',
            background: 'linear-gradient(90deg, #2196F3, #1565C0)',
            color: 'white',
            fontSize: 19,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 8px 36px rgba(33,150,243,0.55)',
            marginBottom: 14,
            letterSpacing: '0.05em',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          NEXT LEVEL →
        </button>

        <button
          onClick={onHome}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            fontWeight: 600,
            padding: '10px 36px',
            borderRadius: 100,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Home
        </button>
      </div>
    </div>
  );
}
