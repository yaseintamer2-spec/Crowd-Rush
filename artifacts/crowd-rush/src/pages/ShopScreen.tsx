import { useState } from 'react';
import { SKINS } from '../game/config';
import type { CoinsState } from '../hooks/useCoins';

interface Props extends CoinsState {
  onBack: () => void;
}

function SkinCharPreview({ colors, size = 44 }: { colors: string[]; size?: number }) {
  const s = size / 44;
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 44 62" fill="none">
      {/* Shadow */}
      <ellipse cx="22" cy="60" rx="10" ry="3" fill="rgba(0,0,0,0.3)" />
      {/* Left leg */}
      <rect x="14" y="38" width="7" height="16" rx="3.5" fill={colors[0]} />
      {/* Right leg */}
      <rect x="23" y="38" width="7" height="16" rx="3.5" fill={colors[0]} />
      {/* Body */}
      <rect x="11" y="20" width="22" height="22" rx="7" fill={colors[1] ?? colors[0]} />
      {/* Left arm */}
      <rect x="2" y="22" width="8" height="14" rx="4" fill={colors[0]} />
      {/* Right arm */}
      <rect x="34" y="22" width="8" height="14" rx="4" fill={colors[0]} />
      {/* Head */}
      <circle cx="22" cy="12" r="11" fill={colors[2] ?? colors[1] ?? colors[0]} />
      {/* Highlight */}
      <circle cx="18" cy="8" r="4" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

export function ShopScreen({ onBack, coins, ownedSkins, activeSkin, buySkin, equipSkin }: Props) {
  const [message, setMessage] = useState<{ text: string; color: string } | null>(null);

  function handleAction(skinId: string, price: number) {
    if (ownedSkins.includes(skinId)) {
      equipSkin(skinId);
      setMessage({ text: 'Equipped!', color: '#76FF03' });
    } else if (coins >= price) {
      buySkin(skinId, price);
      equipSkin(skinId);
      setMessage({ text: `Bought for ${price} coins!`, color: '#FFD700' });
    } else {
      setMessage({ text: `Need ${(price - coins).toLocaleString()} more coins`, color: '#FF5252' });
    }
    setTimeout(() => setMessage(null), 2000);
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(165deg, #060614 0%, #08061a 100%)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '7px 16px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          ← Back
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}>
            SKINS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '0.1em' }}>
            CUSTOMIZE YOUR CROWD
          </div>
        </div>

        {/* Coin balance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(255,215,0,0.08)',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 20,
          padding: '7px 12px',
        }}>
          <span style={{ fontSize: 14 }}>💰</span>
          <span style={{ color: '#FFD700', fontWeight: 800, fontSize: 14 }}>{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Notification */}
      {message && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)',
          border: `1px solid ${message.color}44`,
          borderRadius: 20,
          padding: '10px 24px',
          color: message.color,
          fontSize: 14,
          fontWeight: 700,
          zIndex: 10,
          animation: 'fadeIn 0.2s ease',
          whiteSpace: 'nowrap',
        }}>
          {message.text}
        </div>
      )}

      {/* Skins grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 14px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        alignContent: 'start',
      }}>
        {SKINS.map((skin) => {
          const owned = ownedSkins.includes(skin.id);
          const active = activeSkin === skin.id;
          const canAfford = coins >= skin.price;

          return (
            <div
              key={skin.id}
              onClick={() => handleAction(skin.id, skin.price)}
              style={{
                background: active
                  ? `linear-gradient(145deg, ${skin.gradient[0]}22, ${skin.gradient[1]}11)`
                  : 'rgba(255,255,255,0.04)',
                border: active
                  ? `2px solid ${skin.gradient[0]}`
                  : owned
                  ? '1px solid rgba(255,255,255,0.15)'
                  : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 18,
                padding: '16px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                transition: 'transform 0.1s, box-shadow 0.2s',
                boxShadow: active ? `0 0 20px ${skin.glowColor}` : 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {/* Active badge */}
              {active && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: skin.gradient[0],
                  color: 'white',
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '3px 7px',
                  borderRadius: 10,
                  letterSpacing: '0.05em',
                }}>
                  ON
                </div>
              )}

              {/* Character preview */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 10,
                filter: active ? `drop-shadow(0 0 12px ${skin.glowColor})` : 'none',
              }}>
                <SkinCharPreview colors={skin.colors} />
              </div>

              {/* Skin name */}
              <div style={{
                color: active ? 'white' : 'rgba(255,255,255,0.8)',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 4,
                letterSpacing: '-0.01em',
              }}>
                {skin.emoji} {skin.name}
              </div>

              {/* Price / status */}
              {skin.price === 0 ? (
                <div style={{
                  color: '#76FF03',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}>
                  FREE
                </div>
              ) : owned ? (
                <div style={{
                  color: active ? skin.gradient[0] : 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}>
                  {active ? 'EQUIPPED' : 'OWNED'}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  color: canAfford ? '#FFD700' : 'rgba(255,255,255,0.3)',
                  fontSize: 12,
                  fontWeight: 800,
                }}>
                  <span>💰</span>
                  <span>{skin.price.toLocaleString()}</span>
                  {!canAfford && (
                    <span style={{ color: '#FF5252', fontSize: 9, marginLeft: 2 }}>
                      (need {(skin.price - coins).toLocaleString()} more)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div style={{
        padding: '10px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        flexShrink: 0,
      }}>
        Collect coins in-game to buy skins
      </div>
    </div>
  );
}
