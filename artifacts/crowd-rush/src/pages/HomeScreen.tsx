import { useEffect, useRef } from 'react';
import { SKINS } from '../game/config';

interface Props {
  onPlay: () => void;
  onShop: () => void;
  bestScore: number;
  bestCrowd: number;
  coins: number;
  activeSkin: string;
}

/* ── Animated background canvas ── */
function PreviewCanvas({ skinId }: { skinId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    const skin = SKINS.find((s) => s.id === skinId) ?? SKINS[0];
    const W = canvas.width;
    const H = canvas.height;
    const PATH_W = 220;
    const PL = (W - PATH_W) / 2;
    const PR = PL + PATH_W;
    const CROWD_Y = H * 0.7;

    const state = {
      scroll: 0,
      crowdX: 0.5,
      crowdSize: 12,
      gateWorldY: 500,
      gateDir: 0.3 as number, // crowd moves to 0.3
      phase: 'running' as 'running' | 'approaching' | 'passed' | 'celebrate',
      phaseT: 0,
      particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[],
    };

    function reset() {
      state.scroll = 0;
      state.crowdX = 0.5;
      state.crowdSize = Math.max(8, Math.min(18, state.crowdSize));
      state.gateWorldY = 520;
      state.gateDir = Math.random() > 0.5 ? 0.3 : 0.68;
      state.phase = 'running';
      state.phaseT = 0;
    }

    function spawnParticles(x: number, y: number, color: string, count: number) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.5 + Math.random() * 3;
        state.particles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 1, color, size: 3 + Math.random() * 5 });
      }
    }

    let lastT = 0;
    function draw(ts: number) {
      const dt = Math.min((ts - lastT) / 16.67, 2);
      lastT = ts;

      ctx.clearRect(0, 0, W, H);

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#060614');
      sky.addColorStop(1, '#0a0a20');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = '#4fc3f7';
      ctx.lineWidth = 1;
      const gridS = 40;
      const gOff = (state.scroll * 0.3) % gridS;
      for (let y = -gOff; y < H; y += gridS) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let x = 0; x < W; x += gridS) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      ctx.restore();

      // Grass
      ctx.fillStyle = '#0d1a0d';
      ctx.fillRect(0, 0, PL, H);
      ctx.fillRect(PR, 0, W - PR, H);

      // Path
      const pg = ctx.createLinearGradient(PL, 0, PR, 0);
      pg.addColorStop(0, '#1a1208');
      pg.addColorStop(0.15, '#241a0e');
      pg.addColorStop(0.5, '#2d2214');
      pg.addColorStop(0.85, '#241a0e');
      pg.addColorStop(1, '#1a1208');
      ctx.fillStyle = pg;
      ctx.fillRect(PL, 0, PATH_W, H);

      // Path edge glow
      const egl = ctx.createLinearGradient(PL, 0, PL + 16, 0);
      egl.addColorStop(0, 'rgba(0,0,0,0.6)');
      egl.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = egl;
      ctx.fillRect(PL, 0, 16, H);
      const egr = ctx.createLinearGradient(PR - 16, 0, PR, 0);
      egr.addColorStop(0, 'rgba(0,0,0,0)');
      egr.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = egr;
      ctx.fillRect(PR - 16, 0, 16, H);

      // Lane dashes
      ctx.save();
      ctx.setLineDash([24, 18]);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.lineDashOffset = (state.scroll * 0.5) % 42;
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.restore();

      // Gate
      const gateScreenY = CROWD_Y - (state.gateWorldY - state.scroll);
      if (gateScreenY > -60 && gateScreenY < H + 10) {
        drawPreviewGate(ctx, gateScreenY, PL, PR, W, state.phase === 'passed');
      }

      // Particles
      state.particles = state.particles.filter(p => p.life > 0);
      for (const p of state.particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.025;
      }

      // Crowd blob
      const crowdCX = PL + state.crowdX * PATH_W;
      drawPreviewCrowd(ctx, crowdCX, CROWD_Y, state.crowdSize, skin.colors, ts / 1000);

      // Vignette overlay bottom
      const vig = ctx.createLinearGradient(0, H * 0.45, 0, H);
      vig.addColorStop(0, 'rgba(3,3,18,0)');
      vig.addColorStop(1, 'rgba(3,3,18,0.92)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // Side vignettes
      const vs = ctx.createLinearGradient(0, 0, 60, 0);
      vs.addColorStop(0, 'rgba(3,3,18,0.7)');
      vs.addColorStop(1, 'rgba(3,3,18,0)');
      ctx.fillStyle = vs;
      ctx.fillRect(0, 0, 60, H);
      const vs2 = ctx.createLinearGradient(W - 60, 0, W, 0);
      vs2.addColorStop(0, 'rgba(3,3,18,0)');
      vs2.addColorStop(1, 'rgba(3,3,18,0.7)');
      ctx.fillStyle = vs2;
      ctx.fillRect(W - 60, 0, 60, H);

      // === State machine ===
      state.phaseT += dt;
      state.scroll += 2.2 * dt;

      if (state.phase === 'running') {
        const dist = state.gateWorldY - state.scroll;
        if (dist < 200) {
          state.phase = 'approaching';
          state.phaseT = 0;
        }
      }
      if (state.phase === 'approaching') {
        // Steer crowd toward gate dir
        state.crowdX += (state.gateDir - state.crowdX) * 0.06;
        if (gateScreenY > CROWD_Y - 10 && gateScreenY < CROWD_Y + 10) {
          state.phase = 'passed';
          state.phaseT = 0;
          const gain = Math.floor(state.crowdSize * 0.6 + 3);
          state.crowdSize += gain;
          const cx = PL + state.crowdX * PATH_W;
          spawnParticles(cx, CROWD_Y, skin.colors[2] ?? '#42A5F5', 18);
          spawnParticles(cx, CROWD_Y - 30, '#FFD700', 0);
        }
      }
      if (state.phase === 'passed') {
        state.crowdX += (0.5 - state.crowdX) * 0.04;
        if (state.phaseT > 80) {
          state.phase = 'celebrate';
          state.phaseT = 0;
        }
      }
      if (state.phase === 'celebrate') {
        if (state.phaseT > 60) reset();
      }
      if (state.scroll > state.gateWorldY + 300) reset();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [skinId]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={700}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

function drawPreviewGate(
  ctx: CanvasRenderingContext2D,
  y: number, PL: number, PR: number, W: number, passed: boolean
) {
  const cx = W / 2;
  const h = 70;
  const pw = 10;
  ctx.save();
  if (passed) ctx.globalAlpha = 0.3;

  // Left side (green)
  ctx.fillStyle = '#00C85320';
  ctx.fillRect(PL, y, cx - PL - pw / 2, h);
  ctx.fillStyle = '#00C853';
  ctx.fillRect(PL, y, pw, h);
  ctx.fillRect(cx - pw / 2, y, pw / 2, h);
  ctx.fillRect(PL, y, cx - PL - pw / 2, pw);
  ctx.shadowColor = '#00C853';
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('x2', (PL + cx) / 2, y + h / 2 + 8);

  // Right side (red)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#D5000020';
  ctx.fillRect(cx + pw / 2, y, PR - cx - pw / 2, h);
  ctx.fillStyle = '#D50000';
  ctx.fillRect(PR - pw, y, pw, h);
  ctx.fillRect(cx + pw / 2, y, pw / 2, h);
  ctx.fillRect(cx + pw / 2, y, PR - cx - pw / 2, pw);
  ctx.shadowColor = '#D50000';
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'white';
  ctx.fillText('-5', (PR + cx) / 2, y + h / 2 + 8);

  ctx.restore();
}

function drawPreviewCrowd(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number,
  colors: string[], time: number
) {
  const count = Math.min(size, 40);
  const r = 9;
  const spread = Math.min(2.2, 0.8 + size / 20);

  for (let i = 0; i < count; i++) {
    const angle = (i / Math.max(1, count)) * Math.PI * 2 + i * 0.7;
    const ring = Math.floor(i / 6) + (i === 0 ? 0 : 1);
    const dist = ring * r * spread * 2;
    const x = i === 0 ? cx : cx + Math.cos(angle) * dist + Math.sin(time * 3 + i) * 1.5;
    const bobY = Math.sin(time * 7 + i * 0.8) * 3;
    const y = i === 0 ? cy + bobY : cy + Math.sin(angle) * dist * 0.4 + bobY;

    const color = colors[i % colors.length];
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    // Head
    ctx.fillStyle = lighten(color, 15);
    ctx.beginPath();
    ctx.arc(x, y - r * 1.6, r * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = color;
    const bg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r);
    bg.addColorStop(0, lighten(color, 20));
    bg.addColorStop(1, color);
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Glow under crowd
  const glow = ctx.createRadialGradient(cx, cy + 10, 0, cx, cy + 10, 70);
  glow.addColorStop(0, colors[1] + '30');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 70, 20, 0, 0, Math.PI * 2);
  ctx.fill();
}

function lighten(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgb(${Math.min(255,(n>>16)+amt)},${Math.min(255,((n>>8)&0xff)+amt)},${Math.min(255,(n&0xff)+amt)})`;
}

/* ── Home Screen ── */
export function HomeScreen({ onPlay, onShop, bestScore, bestCrowd, coins, activeSkin }: Props) {
  const skin = SKINS.find((s) => s.id === activeSkin) ?? SKINS[0];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      background: '#03031a',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(180deg, #111827 0%, #0b1020 48%, ${skin.gradient[1]} 180%)`,
      }} />
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 90,
        width: 230,
        height: '74%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg, #576273, #747f92 50%, #576273)',
        borderLeft: `5px solid ${skin.gradient[0]}`,
        borderRight: `5px solid ${skin.gradient[0]}`,
        opacity: 0.95,
      }} />

      {/* Top bar */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px 0',
      }}>
        {/* Coin balance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 24,
          padding: '7px 14px 7px 10px',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #FFF176, #FFD700, #F57F17)',
            boxShadow: '0 0 8px rgba(255,215,0,0.6)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
          }}>💰</div>
          <span style={{ color: '#FFD700', fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>
            {coins.toLocaleString()}
          </span>
        </div>

        {/* Shop button */}
        <button
          onClick={onShop}
          style={{
            background: 'rgba(0,0,0,0.55)',
            border: `1px solid ${skin.gradient[0]}55`,
            borderRadius: 24,
            padding: '7px 16px',
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            backdropFilter: 'blur(8px)',
            letterSpacing: '0.02em',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${skin.gradient[0]}, ${skin.gradient[1]})`,
            display: 'inline-block',
            boxShadow: `0 0 6px ${skin.glowColor}`,
          }} />
          SKINS
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom content area */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 52,
        gap: 0,
      }}>
        {/* App icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: `linear-gradient(145deg, ${skin.gradient[0]}, ${skin.gradient[1]})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 16px 50px ${skin.glowColor}`,
          animation: 'iconFloat 4s ease-in-out infinite',
        }}>
          <svg width={50} height={50} viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="10" r="7.5" fill="rgba(255,255,255,0.85)" />
            <rect x="18" y="20" width="14" height="19" rx="5" fill="rgba(255,255,255,0.85)" />
            <circle cx="10" cy="13" r="5.5" fill="rgba(255,255,255,0.65)" />
            <rect x="4" y="21" width="11" height="15" rx="4" fill="rgba(255,255,255,0.65)" />
            <circle cx="40" cy="13" r="5.5" fill="rgba(255,255,255,0.65)" />
            <rect x="35" y="21" width="11" height="15" rx="4" fill="rgba(255,255,255,0.65)" />
          </svg>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 52,
          fontWeight: 900,
          letterSpacing: '-0.05em',
          lineHeight: 0.88,
          textAlign: 'center',
          marginBottom: 2,
          color: 'white',
          textShadow: '0 2px 30px rgba(255,255,255,0.15)',
        }}>
          CROWD
        </div>
        <div style={{
          fontSize: 52,
          fontWeight: 900,
          letterSpacing: '-0.05em',
          lineHeight: 0.88,
          textAlign: 'center',
          marginBottom: 22,
          background: `linear-gradient(90deg, ${skin.gradient[0]}, ${skin.colors[skin.colors.length - 1] ?? skin.gradient[1]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 0 18px ${skin.glowColor})`,
        }}>
          RUSH
        </div>

        {/* Stats if any */}
        {bestScore > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Best Score', value: bestScore.toLocaleString(), color: '#FFD700' },
              { label: 'Best Crowd', value: bestCrowd, color: '#76FF03' },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '8px 16px',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ color: s.color, fontSize: 18, fontWeight: 900 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Play button */}
        <button
          onClick={onPlay}
          style={{
            padding: '18px 0',
            width: 260,
            borderRadius: 100,
            border: 'none',
            background: `linear-gradient(90deg, ${skin.gradient[0]}, ${skin.gradient[1]})`,
            color: 'white',
            fontSize: 20,
            fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            boxShadow: `0 8px 40px ${skin.glowColor}, 0 0 0 1px rgba(255,255,255,0.06)`,
            marginBottom: 12,
            animation: 'playPulse 2.5s ease-in-out infinite',
            fontFamily: 'Inter, sans-serif',
            transition: 'transform 0.1s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          PLAY NOW
        </button>

        <div style={{
          color: 'rgba(255,255,255,0.28)',
          fontSize: 11,
          letterSpacing: '0.08em',
        }}>
          ∞ ENDLESS LEVELS · EVERY 10: TWIST
        </div>
      </div>
    </div>
  );
}
