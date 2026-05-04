import { useEffect, useRef } from 'react';

interface Props {
  onPlay: () => void;
  bestScore: number;
  bestCrowd: number;
}

export function HomeScreen({ onPlay, bestScore, bestCrowd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }[] = [];
    const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#76FF03','#FFD700'];

    const spawnParticle = () => {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(1 + Math.random() * 2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 8,
        life: 1,
      });
    };

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#0a0a1a');
      bg.addColorStop(1, '#1a0533');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn particles
      if (frame % 8 === 0) spawnParticle();

      // Draw + update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.005;
        if (p.y < -20 || p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.life * 0.7;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

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
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        zIndex: 1,
        paddingBottom: 60,
      }}>
        {/* Logo / Title */}
        <div style={{
          fontSize: 64,
          marginBottom: 4,
          filter: 'drop-shadow(0 0 20px rgba(118,255,3,0.6))',
          animation: 'float 3s ease-in-out infinite',
        }}>
          👥
        </div>

        <div style={{
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          textAlign: 'center',
          marginBottom: 4,
          background: 'linear-gradient(135deg, #76FF03, #00E676, #42A5F5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 12px rgba(118,255,3,0.4))',
        }}>
          CROWD
        </div>
        <div style={{
          fontSize: 42,
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          textAlign: 'center',
          marginBottom: 28,
          background: 'linear-gradient(135deg, #FFD700, #FF6B6B, #FF3D00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 12px rgba(255,215,0,0.4))',
        }}>
          RUSH
        </div>

        {/* Tagline */}
        <div style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: 14,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 36,
          textAlign: 'center',
        }}>
          Grow your crowd · Smash the door
        </div>

        {/* Stats */}
        {bestScore > 0 && (
          <div style={{
            display: 'flex',
            gap: 16,
            marginBottom: 36,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '12px 20px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#FFD700', fontSize: 20, fontWeight: 900 }}>{bestScore}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Score</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '12px 20px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#76FF03', fontSize: 20, fontWeight: 900 }}>{bestCrowd}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Crowd</div>
            </div>
          </div>
        )}

        {/* Play button */}
        <button
          onClick={onPlay}
          style={{
            padding: '18px 72px',
            borderRadius: 50,
            border: 'none',
            background: 'linear-gradient(90deg, #76FF03, #00E676)',
            color: '#0a1a00',
            fontSize: 22,
            fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            boxShadow: '0 8px 40px rgba(118, 255, 3, 0.55), 0 2px 8px rgba(0,0,0,0.4)',
            transition: 'transform 0.12s, box-shadow 0.12s',
            animation: 'pulse 2s ease-in-out infinite',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 50px rgba(118, 255, 3, 0.7), 0 2px 8px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 40px rgba(118, 255, 3, 0.55), 0 2px 8px rgba(0,0,0,0.4)';
          }}
        >
          TAP TO PLAY
        </button>

        {/* Level selector */}
        <div style={{
          marginTop: 28,
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          5 Levels · New challenges await
        </div>

        {/* How to play */}
        <div style={{
          marginTop: 32,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '16px 24px',
          textAlign: 'center',
          maxWidth: 260,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.8 }}>
            <div>👆 <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Drag</strong> left & right to steer</div>
            <div>🚪 Pick the <strong style={{ color: '#76FF03' }}>best gate</strong> to grow your crowd</div>
            <div>💥 <strong style={{ color: '#FFD700' }}>Smash</strong> the final door to win</div>
          </div>
        </div>
      </div>
    </div>
  );
}
