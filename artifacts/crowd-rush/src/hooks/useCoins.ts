import { useState, useCallback, useRef } from 'react';

export interface CoinsState {
  coins: number;
  ownedSkins: string[];
  activeSkin: string;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  buySkin: (skinId: string, price: number) => boolean;
  equipSkin: (skinId: string) => void;
}

export function useCoins(): CoinsState {
  const [coins, setCoins] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('cr_coins') || '0'); } catch { return 0; }
  });
  const [ownedSkins, setOwnedSkins] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('cr_skins') || '["blue"]'); } catch { return ['blue']; }
  });
  const [activeSkin, setActiveSkin] = useState<string>(() => {
    try { return localStorage.getItem('cr_skin') || 'blue'; } catch { return 'blue'; }
  });

  const coinsRef = useRef(coins);
  coinsRef.current = coins;

  const addCoins = useCallback((amount: number) => {
    setCoins((c) => {
      const next = c + amount;
      try { localStorage.setItem('cr_coins', String(next)); } catch {}
      return next;
    });
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    if (coinsRef.current < amount) return false;
    setCoins((c) => {
      const next = Math.max(0, c - amount);
      try { localStorage.setItem('cr_coins', String(next)); } catch {}
      return next;
    });
    return true;
  }, []);

  const buySkin = useCallback((skinId: string, price: number): boolean => {
    if (coinsRef.current < price) return false;
    setCoins((c) => {
      const next = Math.max(0, c - price);
      try { localStorage.setItem('cr_coins', String(next)); } catch {}
      return next;
    });
    setOwnedSkins((prev) => {
      const next = prev.includes(skinId) ? prev : [...prev, skinId];
      try { localStorage.setItem('cr_skins', JSON.stringify(next)); } catch {}
      return next;
    });
    return true;
  }, []);

  const equipSkin = useCallback((skinId: string) => {
    setActiveSkin(skinId);
    try { localStorage.setItem('cr_skin', skinId); } catch {}
  }, []);

  return { coins, ownedSkins, activeSkin, addCoins, spendCoins, buySkin, equipSkin };
}
