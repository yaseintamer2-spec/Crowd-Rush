import { useEffect, useRef } from 'react';
import { LEVELS } from '../game/levels';

interface Props {
  level: number;
  crowdSize: number;
  score: number;
  onNext: () => void;
  onHome: () => void;
  isLastLevel: boolean;
}

export function LevelCompleteScreen({ level, crowdSize, score, onNext, onHome, isLastLevel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const confetti: { x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; rotV: number }[] = [];
    const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFD700','#DDA0DD','#76FF03','#FF3D00'];

    for (let i = 0; i < 80; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: 1.5 + Math.random() * 2.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.15,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#0a1a00');
      bg.addColorStop(1, '#001a0a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const c of confetti) {
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.rotV;
        if (c.y > canvas.height + 20) c.y = -20;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const stars = crowdSize >= 50 ? 3 : crowdSize >= 25 ? 2 : 1;

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
        width={400}
        height={700}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        paddingBottom: 60,
      }}>
        {/* Trophy */}
        <div style={{
          fontSize: 72,
          marginBottom: 8,
          filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.8))',
          animation: 'bounceIn 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        }}>
          🏆
        </div>

        {/* Level complete text */}
        <div style={{
          fontSize: 13,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#76FF03',
          marginBottom: 4,
          fontWeight: 700,
        }}>
          Level {level} Complete!
        </div>

        <div style={{
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #FFD700, #FF9800)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 20,
        }}>
          {isLastLevel ? 'YOU WIN! 🎉' : 'SMASHED IT!'}
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, fontSize: 36 }}>
          {[1, 2, 3].map((s) => (
            <span key={s} style={{
              filter: s <= stars ? 'drop-shadow(0 0 8px rgba(255,215,0,0.8))' : 'none',
              opacity: s <= stars ? 1 : 0.2,
              animation: s <= stars ? `starPop ${0.3 + s * 0.15}s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards` : 'none',
              display: 'inline-block',
            }}>
              ⭐
            </span>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
        }}>
          <StatCard label="Crowd Size" value={crowdSize} color="#76FF03" icon="👥" />
          <StatCard label="Score" value={score} color="#FFD700" icon="💎" />
        </div>

        {/* Buttons */}
        {!isLastLevel ? (
          <button
            onClick={onNext}
            style={{
              padding: '18px 64px',
              borderRadius: 50,
              border: 'none',
              background: 'linear-gradient(90deg, #76FF03, #00E676)',
              color: '#0a1a00',
              fontSize: 20,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 8px 40px rgba(118, 255, 3, 0.55)',
              marginBottom: 16,
              letterSpacing: '0.04em',
            }}
          >
            NEXT LEVEL →
          </button>
        ) : (
          <button
            onClick={onHome}
            style={{
              padding: '18px 64px',
              borderRadius: 50,
              border: 'none',
              background: 'linear-gradient(90deg, #FFD700, #FF9800)',
              color: '#1a0a00',
              fontSize: 20,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 8px 40px rgba(255, 215, 0, 0.55)',
              marginBottom: 16,
              letterSpacing: '0.04em',
            }}
          >
            PLAY AGAIN 🏆
          </button>
        )}

        <button
          onClick={onHome}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
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
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: '14px 20px',
      textAlign: 'center',
      minWidth: 100,
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ color, fontSize: 24, fontWeight: 900 }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}
